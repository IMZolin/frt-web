import React from 'react'
import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import TifViewer from '../components/TifViewer';

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/TifViewer">
                <TifViewer/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews