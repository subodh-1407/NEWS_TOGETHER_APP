import { normalizeApiBase } from './api';
test.each([
 ['https://example.com','https://example.com/api/v1'],
 ['https://example.com/','https://example.com/api/v1'],
 ['https://example.com/api','https://example.com/api/v1'],
 ['https://example.com/api/v1/','https://example.com/api/v1'],
 ['http://localhost:4000','http://localhost:4000/api/v1'],
])('normalizes API configuration %s without duplicating route prefixes',(input,expected)=>{expect(normalizeApiBase(input)).toBe(expected);});
