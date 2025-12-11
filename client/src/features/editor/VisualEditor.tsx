
import React from 'react';
import { useDiagramStore } from '../../store/diagramStore';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';



export const VisualEditor: React.FC = () => {
    const {
        participants,
        messages,
        addParticipant,
        updateParticipant,
        removeParticipant,
        moveParticipant,
        addMessage,
        updateMessage,
        removeMessage,
        addParameter,
        updateParameter,
        removeParameter,
        moveParameter
    } = useDiagramStore();

    return (
        <div className="flex flex-col h-full gap-6 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

            {/* Participants Section */}
            <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Participants</h2>
                    <button
                        onClick={() => addParticipant('NewParticipant')}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} /> Add
                    </button>
                </div>

                <div className="space-y-3">
                    {participants.map((participant, index) => (
                        <div key={participant.id} className="flex flex-col gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => moveParticipant(participant.id, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                        title="Move Up"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => moveParticipant(participant.id, 'down')}
                                        disabled={index === participants.length - 1}
                                        className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                        title="Move Down"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                </div>

                                <div className="flex-1 flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={participant.name}
                                        onChange={(e) => updateParticipant(participant.id, e.target.value, participant.logicalName)}
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Physical Name (ID)"
                                    />
                                    <input
                                        type="text"
                                        value={participant.logicalName || ''}
                                        onChange={(e) => updateParticipant(participant.id, participant.name, e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Logical Name (Optional)"
                                    />
                                </div>

                                <button
                                    onClick={() => removeParticipant(participant.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors self-start"
                                    title="Remove Participant"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {participants.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">No participants yet.</p>
                    )}
                </div>
            </section>

            {/* Messages Section */}
            <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Messages</h2>
                    <button
                        onClick={() => {
                            if (participants.length >= 2) {
                                addMessage(participants[0].id, participants[1].id, 'Message');
                            } else if (participants.length === 1) {
                                addMessage(participants[0].id, participants[0].id, 'Self Call');
                            }
                        }}
                        disabled={participants.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus size={16} /> Add
                    </button>
                </div>

                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                        <select
                                            value={message.fromId}
                                            onChange={(e) => updateMessage(message.id, { fromId: e.target.value })}
                                            className="flex-1 w-0 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>





                                        <select
                                            value={message.toId}
                                            onChange={(e) => updateMessage(message.id, { toId: e.target.value })}
                                            className="flex-1 w-0 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => removeMessage(message.id)}
                                        className="flex-none p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        title="Remove Message"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={message.content}
                                        onChange={(e) => updateMessage(message.id, { content: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Message Content (Physical)"
                                    />
                                    <input
                                        type="text"
                                        value={message.logicalName || ''}
                                        onChange={(e) => updateMessage(message.id, { logicalName: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Message Logical Name (Optional)"
                                    />

                                    {/* Parameters Section */}
                                    <div className="mt-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-500">Return Value:</span>
                                                <select
                                                    value={message.returnValueType || 'void'}
                                                    onChange={(e) => updateMessage(message.id, { returnValueType: e.target.value as any })}
                                                    className="px-2 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="void">void</option>
                                                    <option value="string">String</option>
                                                    <option value="number">Number</option>
                                                    <option value="boolean">Boolean</option>
                                                    <option value="object">Object</option>
                                                    <option value="any">Any</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={() => addParameter(message.id, 'param', 'string')}
                                                className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-blue-600 transition-colors"
                                            >
                                                + Add Param
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            {message.parameters?.map((param, pIndex) => (
                                                <div key={param.id} className="flex items-center gap-1">
                                                    <div className="flex flex-col">
                                                        <button
                                                            onClick={() => moveParameter(message.id, param.id, 'up')}
                                                            disabled={pIndex === 0}
                                                            className="text-[10px] text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            onClick={() => moveParameter(message.id, param.id, 'down')}
                                                            disabled={pIndex === (message.parameters?.length || 0) - 1}
                                                            className="text-[10px] text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={param.name}
                                                        onChange={(e) => updateParameter(message.id, param.id, { name: e.target.value })}
                                                        className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        placeholder="Name"
                                                    />
                                                    <select
                                                        value={param.type}
                                                        onChange={(e) => updateParameter(message.id, param.id, { type: e.target.value })}
                                                        className="w-20 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="string">String</option>
                                                        <option value="number">Number</option>
                                                        <option value="boolean">Boolean</option>
                                                        <option value="object">Object</option>
                                                        <option value="any">Any</option>
                                                    </select>
                                                    <button
                                                        onClick={() => removeParameter(message.id, param.id)}
                                                        className="p-1 text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No messages. Add some participants and messages to start.</p>
                    )}
                </div>
            </section>
        </div>
    );
};
