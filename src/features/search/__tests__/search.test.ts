/**
 * Property-based tests for search functionality.
 * Property 11 — Page number search correctness (Req 27.4)
 */

import * as fc from 'fast-check';
import { defaultSearchProvider } from '../index';

describe('Property 11 — Page number search correctness', () => {
    it('searching a page number string always returns a page result with the correct pageNumber', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 604 }), (n) => {
                const results = defaultSearchProvider.search(String(n));
                const pageResult = results.find(
                    (r) => r.type === 'page' && r.pageNumber === n,
                );
                expect(pageResult).toBeDefined();
            }),
        );
    });

    it('searching a non-numeric string never returns a page-type result', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }).filter((s) => isNaN(Number(s.trim()))),
                (query) => {
                    const results = defaultSearchProvider.search(query);
                    const pageResults = results.filter((r) => r.type === 'page');
                    expect(pageResults).toHaveLength(0);
                },
            ),
        );
    });
});
