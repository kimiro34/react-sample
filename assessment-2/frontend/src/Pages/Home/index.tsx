import React from 'react'
import { SensorUpdate } from '../SensorUpdate'
import { Container, Divider } from '@mui/material';
import { params } from '../../Config/constant';

export default function HomePage() {
    return (
        <Container>
            <SensorUpdate params = {params.param1}/>
            <Divider/>
            <SensorUpdate params = {params.param2}/>
        </Container>
    )
}
