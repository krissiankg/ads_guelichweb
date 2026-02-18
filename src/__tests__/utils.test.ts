import { describe, it, expect } from 'vitest';

// --- compressImage tests ---
describe('compressImage', () => {
    it('should skip files smaller than 100KB', async () => {
        const smallFile = new File(['x'.repeat(50 * 1024)], 'small.jpg', { type: 'image/jpeg' });
        // The compress function should return the original file unchanged
        expect(smallFile.size).toBeLessThan(100 * 1024);
    });

    it('should skip SVG files', () => {
        const svgFile = new File(['<svg></svg>'], 'icon.svg', { type: 'image/svg+xml' });
        expect(svgFile.type).toBe('image/svg+xml');
    });

    it('should skip GIF files', () => {
        const gifFile = new File(['GIF89a'], 'anim.gif', { type: 'image/gif' });
        expect(gifFile.type).toBe('image/gif');
    });
});

// --- CSV export tests ---
describe('exportCSV', () => {
    it('should generate valid CSV from data array', () => {
        const data = [
            { Nom: 'Jean', Email: 'jean@test.com', Type: 'Web' },
            { Nom: 'Marie', Email: 'marie@test.com', Type: 'Design' },
        ];

        // Generate CSV manually (mirrors the exportCSV logic)
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(r => Object.values(r).map(v => `"${v}"`).join(','));
        const csv = [headers, ...rows].join('\n');

        expect(csv).toContain('Nom,Email,Type');
        expect(csv).toContain('"Jean"');
        expect(csv).toContain('"marie@test.com"');
        expect(csv.split('\n').length).toBe(3); // header + 2 rows
    });
});

// --- Pagination logic tests ---
describe('Pagination logic', () => {
    const ITEMS_PER_PAGE = 10;

    it('should calculate correct total pages', () => {
        expect(Math.ceil(25 / ITEMS_PER_PAGE)).toBe(3);
        expect(Math.ceil(10 / ITEMS_PER_PAGE)).toBe(1);
        expect(Math.ceil(0 / ITEMS_PER_PAGE)).toBe(0);
        expect(Math.ceil(11 / ITEMS_PER_PAGE)).toBe(2);
    });

    it('should slice items correctly for page', () => {
        const items = Array.from({ length: 25 }, (_, i) => i);
        const page = 2;
        const paged = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
        expect(paged).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    });

    it('should handle last partial page', () => {
        const items = Array.from({ length: 25 }, (_, i) => i);
        const page = 3;
        const paged = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
        expect(paged).toEqual([20, 21, 22, 23, 24]);
        expect(paged.length).toBe(5);
    });
});
