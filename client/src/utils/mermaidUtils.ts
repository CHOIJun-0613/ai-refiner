import type { Participant, Message } from '../store/diagramStore';

export const generateMermaidCode = (participants: Participant[], messages: Message[], viewMode: 'physical' | 'logical' = 'physical'): string => {
    let code = 'sequenceDiagram\n';

    // Mermaid용 ID 살균 (하이픈 제거, 접두사 추가)
    const safeId = (id: string) => `p_${id.replace(/-/g, '_')}`;

    // 참가자 추가
    participants.forEach((p) => {
        // viewMode에 따라 표시 이름 결정
        const displayName = (viewMode === 'logical' && p.logicalName) ? p.logicalName : p.name;

        // 이름에 포함된 따옴표 이스케이프 처리
        const safeName = displayName.replace(/"/g, '&quot;');
        code += `    participant ${safeId(p.id)} as ${safeName}\n`;
    });

    code += '\n';

    // 생명선(lifeline) 관리를 위한 활성화 상태 및 출처 추적
    const activationCounts: Record<string, number> = {};
    const activationOrigins: Record<string, 'incoming' | 'outgoing'> = {};

    // 활성 호출 추적을 위한 스택: { source, target, returnValueType }
    const callStack: { source: string; target: string; returnValueType: string }[] = [];

    // 메시지 추가
    messages.forEach((m) => {
        // ID 사용 (from/to)
        const arrow = m.type === 'dotted' ? '-->>' : '->>';

        // viewMode에 따라 메시지 내용 결정
        const displayContent = (viewMode === 'logical' && m.logicalName) ? m.logicalName : m.content;

        // 실선(solid) 호출인 경우 (이전 스코프가 끝날 수 있음)
        if (m.type === 'solid') {
            // 휴리스틱: A -> B 호출 시, 여전히 스택 최상위 호출 내부에 있는지 확인해야 함.
            // 하지만 더 간단한 요구사항은 "반환 메시지를 별도로 등록하지 않음"임.
            // 따라서 단순히 이 새 호출을 푸시함.
            // 하지만 스택 이전 호출이 A->B였는데, 이제 A->C가 보인다면? A->B가 끝났음을 의미할 수 있음.
            // A가 B를 호출하고, B가 반환하고, 그 후 A가 C를 호출하는 경우.
            // 또는 A가 B를 호출하고, B가 C를 호출하는 중첩(nested) 경우.

            // 암시적 반환(Implicit Return) 로직:
            // 이전 활성 호출의 target이 현재 메시지의 source라면, 중첩된 호출(Nested call)입니다. (A->B 중인데 B->C)
            // 이전 활성 호출의 source가 현재 메시지의 source라면, 같은 컨텍스트에서의 형제 호출(Sibling call)일 수 있습니다. (A->B, 그다음 A->C)
            // 이 경우, A->B는 종료된 것으로 간주합니다.

            // 스택 상단 확인
            while (callStack.length > 0) {
                const top = callStack[callStack.length - 1];
                if (top.target === m.fromId) {
                    // 현재 source가 스택 상단의 target과 일치함. 즉 중첩 호출임.
                    // 예: A->B (활성), 이제 B->C.
                    break; // 새 호출을 푸시하기 위해 계속 진행.
                } else if (top.source === m.fromId) {
                    // 현재 source가 스택 상단의 source와 일치함. 즉 같은 컨텍스트의 형제 호출임.
                    // 예: A->B (활성), 이제 A->C.
                    // A->B에 대한 암시적 반환 생성.
                    const popped = callStack.pop()!;

                    const retVal = popped.returnValueType && popped.returnValueType !== 'void'
                        ? `return(${popped.returnValueType})`
                        : 'return(void)';

                    code += `    ${safeId(popped.target)}-->>${safeId(popped.source)}: ${retVal}\n`;

                    // 팝(pop)된 호출의 target 비활성화
                    if (activationCounts[popped.target] && activationCounts[popped.target] > 0) {
                        code += `    deactivate ${safeId(popped.target)}\n`;
                        activationCounts[popped.target]--;
                    }
                    // 필요한 경우 source 비활성화 (자동 활성화되었던 경우)
                    if (activationCounts[popped.source] && activationCounts[popped.source] > 0 && activationOrigins[popped.source] === 'outgoing') {
                        // 여전히 활성 사용처가 있는지 확인?
                        // 사실 이전 단계의 간단한 로직:
                        // "Target은 'outgoing' 개시자로 활성화된 경우만 비활성화" -> 이 로직은 반환 화살표의 'source'(즉 호출의 target)를 위한 것이었음.

                        // Let's stick to the previous robust logic but applied to implicit returns.
                    }
                } else {
                    // 메시지가 스택 상단과 전혀 관계가 없는 경우?
                    // 예: A->B인데 D->E가 나옴.
                    // 모두 닫아야 할까?
                    // 안전을 위해, 일치하는 것을 찾거나 스택이 빌 때까지 닫는다고 가정.
                    const popped = callStack.pop()!;

                    const retVal = popped.returnValueType && popped.returnValueType !== 'void'
                        ? `return(${popped.returnValueType})`
                        : 'return(void)';

                    code += `    ${safeId(popped.target)}-->>${safeId(popped.source)}: ${retVal}\n`;

                    if (activationCounts[popped.target] > 0) {
                        code += `    deactivate ${safeId(popped.target)}\n`;
                        activationCounts[popped.target]--;
                    }
                }
            }
        }

        // 파라미터 포맷팅
        let paramString = '';
        if (m.type === 'solid') {
            if (m.parameters && m.parameters.length > 0) {
                paramString = '(' + m.parameters.map(p => `${p.name}: ${p.type}`).join(', ') + ')';
            } else {
                paramString = '()';
            }
        }

        const fullContent = (displayContent || ' ') + paramString;
        const safeContent = fullContent.replace(/"/g, '&quot;');

        code += `    ${safeId(m.fromId)}${arrow}${safeId(m.toId)}: ${safeContent}\n`;

        // 자동 활성화 로직
        if (m.type === 'solid') {
            // 스택에 푸시
            callStack.push({
                source: m.fromId,
                target: m.toId,
                returnValueType: m.returnValueType || 'void'
            });

            // 요청 -> Target 활성화
            // 또한 Source가 개시자(initiator)이고 현재 비활성 상태라면 Source도 활성화
            if (!activationCounts[m.fromId]) {
                code += `    activate ${safeId(m.fromId)}\n`;
                activationCounts[m.fromId] = 1;
                activationOrigins[m.fromId] = 'outgoing';
            }

            // Target은 항상 활성화
            code += `    activate ${safeId(m.toId)}\n`;
            if (!activationCounts[m.toId]) {
                activationCounts[m.toId] = 0;
                activationOrigins[m.toId] = 'incoming';
            }
            activationCounts[m.toId]++;

        } else {
            // 수동 점선 (레거시 또는 특정 오버라이드?)
            // 사용자가 UI에서 점선을 입력하면 존중하거나 무시해야 함.
            // "반환 메시지를 별도로 등록하지 않음" -> UI에서 점선 메시지를 무시한다는 의미?
            // 하지만 데이터에 있다면(구버전 데이터 등) 처리함.

            // 응답 (점선) -> Source 비활성화
            if (activationCounts[m.fromId] && activationCounts[m.fromId] > 0) {
                code += `    deactivate ${safeId(m.fromId)}\n`;
                activationCounts[m.fromId]--;
            }

            if (activationCounts[m.toId] && activationCounts[m.toId] > 0 && activationOrigins[m.toId] === 'outgoing') {
                code += `    deactivate ${safeId(m.toId)}\n`;
                activationCounts[m.toId]--;
            }
        }
    });

    // 정리: 스택에 남아있는 모든 호출 종료
    while (callStack.length > 0) {
        const popped = callStack.pop()!;

        const retVal = popped.returnValueType && popped.returnValueType !== 'void'
            ? `return(${popped.returnValueType})`
            : 'return(void)';

        code += `    ${safeId(popped.target)}-->>${safeId(popped.source)}: ${retVal}\n`;

        if (activationCounts[popped.target] > 0) {
            code += `    deactivate ${safeId(popped.target)}\n`;
            activationCounts[popped.target]--;
        }

        // 스택이 비었고 source가 outgoing으로 활성화되어 있다면 비활성화
        if (callStack.length === 0 && activationCounts[popped.source] > 0 && activationOrigins[popped.source] === 'outgoing') {
            code += `    deactivate ${safeId(popped.source)}\n`;
            activationCounts[popped.source]--;
        }
    }

    return code;
};
