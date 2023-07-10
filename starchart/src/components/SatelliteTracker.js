import React, { useEffect, useRef } from 'react';
import { Cesium, Viewer } from 'cesium';
import satellite from 'satellite.js';

const SatelliteTracker = () => {
    const viewerRef = useRef(null);

    useEffect = (() => {
        viewerRef.current = new Viewer('cesiumContainer', {
            animation: false,
            timeline: false,
        });

        const updateSatellitePosition = () => {
            // ISS (ZARYA) Two-line Element Set data
            const ISS_TLE_1 = '1 25544U 98067A   23191.77372685  .00010069  00000+0  18635-3 0  9992';
            const ISS_TLE_2 = '2 25544  51.6410 211.6305 0000177 110.5531 232.6208 15.49658531405445';

            const satrec = satellite.twoline2satrec(ISS_TLE_1, ISS_TLE_2);

            // Satellite Position and Velocity on a given date
            const date = new Date();
            const positionAndVelocity = satellite.propagate(satrec, date);

            // ECI: Earth-Centered Inertial Coordinates
            const positionEci = positionAndVelocity.position;
            const gmst = satellite.gmst(date);

            // Positional data (Geodetic)
            const positionGd = satellite.eciToGeodetic(positionEci, gmst);
            const latitude = satellite.degreesLat(positionGd.latitude);
            const longitude = satellite.degreesLong(positionGd.longitude);
            const attitude = positionGd.height;

            viewerRef.current.entities.add({
                position: Cesium.Cartesian.fromDegress(longitude, latitude, attitude),
                point: { pixelSize: 10, color: Cesium.color.Red},
            });
        };

        const interval = setInterval(updateSatellitePosition, 1000);

        return () => {
            clearInterval(interval);
            viewerRef.current?.destroy();
        };
    }, []);

    return <div id="cesiumContainer" style={{ width: '100%', height: '400px' }} />;
};

export default SatelliteTracker;