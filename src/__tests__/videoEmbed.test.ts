import { describe, it, expect } from 'vitest';
import { getEmbedSrc } from '../lib/videoEmbed';

describe('getEmbedSrc', () => {
    it('extracts the src of a YouTube iframe snippet', () => {
        const embed = '<iframe width="560" height="315" src="https://www.youtube.com/embed/abc123?si=x&amp;t=5" title="YouTube video player" allowfullscreen></iframe>';
        expect(getEmbedSrc(embed)).toBe('https://www.youtube.com/embed/abc123?si=x&t=5');
    });

    it('extracts the src of Vimeo and Mega snippets', () => {
        expect(getEmbedSrc("<iframe src='https://player.vimeo.com/video/42' frameborder='0'></iframe>"))
            .toBe('https://player.vimeo.com/video/42');
        expect(getEmbedSrc('<iframe width="640" height="360" frameborder="0" src="https://mega.nz/embed/AbC#key" allowfullscreen></iframe>'))
            .toBe('https://mega.nz/embed/AbC#key');
    });

    it('accepts a plain https URL and protocol-relative src', () => {
        expect(getEmbedSrc('  https://player.vimeo.com/video/42  ')).toBe('https://player.vimeo.com/video/42');
        expect(getEmbedSrc('<iframe src="//www.youtube.com/embed/abc"></iframe>')).toBe('https://www.youtube.com/embed/abc');
    });

    it('rejects scripts, javascript: and non-https sources', () => {
        expect(getEmbedSrc('<img src=x onerror="alert(1)">')).toBeNull();
        expect(getEmbedSrc('<script>alert(1)</script>')).toBeNull();
        expect(getEmbedSrc('<iframe src="javascript:alert(1)"></iframe>')).toBeNull();
        expect(getEmbedSrc('<iframe src="http://example.com/video"></iframe>')).toBeNull();
    });

    it('returns null for empty values', () => {
        expect(getEmbedSrc('')).toBeNull();
        expect(getEmbedSrc(null)).toBeNull();
        expect(getEmbedSrc(undefined)).toBeNull();
    });
});
