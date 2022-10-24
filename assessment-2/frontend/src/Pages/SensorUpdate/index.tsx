import React, {useState} from 'react'
import { StyledSlider, StyledParent, StyledButtonGroup, StyledButton } from './Styles';
import { Typography } from '@mui/material';
import { SaveAction, CancelAction } from '../../Hooks';

export function SensorUpdate({params}:any) {
    const { max, min, step, marks, id, name } = params;
    const [value, setValue] = useState(max/2);

    const changeValue = (event: any) => {
        setValue(event.target.value);
    };

    const saveHandle = () => {
        const res = SaveAction(id, name, value );
        window.alert(`Successful updated the parameter #${id}`);
    }

    const cancelHandle = () => {
        const res = CancelAction(id);
        window.alert(`Successful canceled the parameter #${id}`);
    }

    return (
        <StyledParent>
            <Typography gutterBottom variant="h4">SenSor Parameter #{id}</Typography>
            <StyledSlider
                valueLabelDisplay="auto"
                value={value}
                max={max}
                min={min}
                step={step}
                onChange={changeValue}
                marks={marks}
            />
            <StyledButtonGroup>
                <StyledButton onClick={()=>saveHandle()} variant="contained">Save</StyledButton>
                <StyledButton onClick={()=>cancelHandle()} variant="outlined">Cancel</StyledButton>
            </StyledButtonGroup>
        </StyledParent>
    )
}