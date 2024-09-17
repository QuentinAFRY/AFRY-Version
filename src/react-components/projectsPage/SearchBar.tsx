import * as React from 'react';

interface Props {
    onChange: (value: string) => void
}

export function SearchBar(props: Props) {

    return(
        <div style={{ display: "flex", alignItems: "center", columnGap: 10, width: "40%"}}>
            <input
                onChange={(e) => {props.onChange(e.target.value)}}
                type='text'
                placeholder='Search projects by name...'
                style={{ width: "100%", height: "40px", backgroundColor: "var(--primary-grey-300)"}}
            />
        </div>
    )
}