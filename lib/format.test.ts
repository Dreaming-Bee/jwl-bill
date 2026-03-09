import { formatCurrency } from './format';

describe('formatCurrency', () => {
    it('should format amount as LKR with comma separators', () => {
        expect(formatCurrency(1000)).toBe('LKR 1,000');
        expect(formatCurrency(100000)).toBe('LKR 1,00,000');
        expect(formatCurrency(54.5)).toBe('LKR 54.5');
    });

    it('should handle zero gracefully', () => {
        expect(formatCurrency(0)).toBe('LKR 0');
    });
});
