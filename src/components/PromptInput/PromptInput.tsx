import React from 'react';
import './PromptInput.css';

interface Props {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export const PromptInput: React.FC<Props> = ({ value, onChange, placeholder }) => {
    return (
        <div className="prompt-input-wrapper">
            <textarea
                className="prompt-textarea"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "Type or paste your text here..."}
                spellCheck={false}
            />
        </div>
    );
};
