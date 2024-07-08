import React, { useState} from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@mui/material';
import './style.css';
import Tooltip from "../../components/ToolTip/ToolTip";

const MainPage = () => {

    const [tooltip, setTooltip] = useState({ message: '', visible: false, x: 0, y: 0 });

    const handleMouseEnter = (e, message) => {
        const { clientX, clientY } = e;
        setTooltip({ message, visible: true, x: clientX, y: clientY });
    };

    const handleMouseLeave = () => {
        setTooltip({ ...tooltip, visible: false });
    };

    return (
        <div>
            <h3 align="center">Menu</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }} className="menu-container">
                <Button
                    variant="contained"
                    style={{ backgroundColor: 'var(--button-color)', padding: "8px 8px", fontSize: "14px" }}
                    className="menu-options"
                    component={Link}
                    to="/bead_extractor"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Extract beads from image')}
                    onMouseLeave={handleMouseLeave}
                >
                    Bead extraction
                </Button>
                <Button
                    variant="contained"
                    style={{ backgroundColor: 'var(--button-color)', padding: "8px 8px", fontSize: "14px" }}
                    className="menu-options"
                    component={Link}
                    to="/psf"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Calculate point spread function')}
                    onMouseLeave={handleMouseLeave}
                >
                    PSF calculation
                </Button>
                <Button
                    variant="contained"
                    style={{ backgroundColor: 'var(--button-color2)', padding: "8px 8px", fontSize: "14px" }}
                    className="menu-options"
                    component={Link}
                    to="/deconvolution"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Perform RL deconvolution')}
                    onMouseLeave={handleMouseLeave}
                >
                    RL deconvolution
                </Button>
                <Button
                    variant="contained"
                    style={{ backgroundColor: 'var(--button-color2)', padding: "8px 8px", fontSize: "14px" }}
                    className="menu-options"
                    component={Link}
                    to="/network"
                    onMouseEnter={(e) => handleMouseEnter(e, 'Perform CNN deconvolution')}
                    onMouseLeave={handleMouseLeave}
                >
                    CNN deconvolution
                </Button>
                <Button
                    variant="contained"
                    style={{ backgroundColor: 'var(--button-color)', padding: "8px 8px", fontSize: "14px" }}
                    className="menu-options"
                    component={Link}
                    to="/authors"
                    onMouseEnter={(e) => handleMouseEnter(e, 'View authors information')}
                    onMouseLeave={handleMouseLeave}
                >
                    Authors
                </Button>
            </div>
            <Tooltip message={tooltip.message} visible={tooltip.visible} x={tooltip.x} y={tooltip.y} />
            <Outlet />
        </div>
    );
};

export default MainPage;
