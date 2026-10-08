import { Pipe, PipeTransform } from '@angular/core';
import { ArtistRef } from './models';

export const mmss = (ms: number) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
export const hoursMinutes = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`);
export const compact = (n: number | null | undefined) => (n == null ? '–' : Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n));
export const year = (d: string | null | undefined) => (d ? d.slice(0, 4) : '');

@Pipe({ name: 'mmss' }) export class MmssPipe implements PipeTransform { transform(ms: number) { return mmss(ms); } }
@Pipe({ name: 'compact' }) export class CompactPipe implements PipeTransform { transform(n: number | null | undefined) { return compact(n); } }
@Pipe({ name: 'year' }) export class YearPipe implements PipeTransform { transform(d: string | null | undefined) { return year(d); } }
@Pipe({ name: 'names' }) export class NamesPipe implements PipeTransform { transform(a: ArtistRef[] | null | undefined) { return (a ?? []).map(x => x.name).join(', '); } }
