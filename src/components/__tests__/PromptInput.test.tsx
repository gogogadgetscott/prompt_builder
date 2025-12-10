import { render, screen, fireEvent } from '@testing-library/react';
import { PromptInput } from '../PromptInput/PromptInput';

describe('PromptInput', () => {
    it('renders with default placeholder', () => {
        render(<PromptInput value="" onChange={() => { }} />);
        expect(screen.getByPlaceholderText('Type or paste your text here...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
        render(<PromptInput value="" onChange={() => { }} placeholder="Custom placeholder" />);
        expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });

    it('displays the current value', () => {
        render(<PromptInput value="Hello World" onChange={() => { }} />);
        expect(screen.getByRole('textbox')).toHaveValue('Hello World');
    });

    it('calls onChange when text is changed', () => {
        const handleChange = vi.fn();
        render(<PromptInput value="" onChange={handleChange} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New text' } });

        expect(handleChange).toHaveBeenCalledWith('New text');
    });
});
