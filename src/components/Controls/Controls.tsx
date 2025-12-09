import React from 'react';
import './Controls.css';

interface Option {
    value: string;
    label: string;
}

const TONES: Option[] = [
    { value: '', label: 'Default Tone' },
    { value: 'Professional', label: 'Professional' },
    { value: 'Casual', label: 'Casual' },
    { value: 'Enthusiastic', label: 'Enthusiastic' },
    { value: 'Witty', label: 'Witty' },
];

const LENGTHS: Option[] = [
    { value: '', label: 'Default Length' },
    { value: 'Short', label: 'Short' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Long', label: 'Long' },
];

interface Props {
    tone: string;
    setTone: (t: string) => void;
    length: string;
    setLength: (l: string) => void;
}

export const Controls: React.FC<Props> = ({ tone, setTone, length, setLength }) => {
    return (
        <div className="controls-container">
            <div className="control-group">
                <label className="control-label">Tone</label>
                <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="control-select"
                >
                    {TONES.map((t) => (
                        <option key={t.label} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            <div className="control-group">
                <label className="control-label">Length</label>
                <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="control-select"
                >
                    {LENGTHS.map((l) => (
                        <option key={l.label} value={l.value}>{l.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
