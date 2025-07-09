'use client';

import * as React from 'react';

export function DateRangePicker({ onUpdate }: { onUpdate: (args: { range: { from?: Date, to?: Date }}) => void }) {
    // Placeholder component
    return (
        <div>
            <input type="date" onChange={e => onUpdate({ range: { from: new Date(e.target.value) }})} />
            <input type="date" onChange={e => onUpdate({ range: { to: new Date(e.target.value) }})} />
        </div>
    );
} 