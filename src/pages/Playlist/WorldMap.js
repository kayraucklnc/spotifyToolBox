import React, {useEffect, useState} from 'react';
import SvgMap from 'svgmap';

const WorldMap = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const sampleData = {
        'US': {population: 327, color: '#ff5722'}, // United States
        'DE': {population: 82, color: '#ffeb3b'},  // Germany
        'FR': {population: 67, color: '#00bcd4'}  // France
        // Diğer ülkeler...
    };

    useEffect(() => {
        new SvgMap({
            targetElementID: 'my-svg-map',
            data: {
                data: {
                    population: {
                        name: 'Population in millions',
                        format: '{0}M',
                        thousandSeparator: ','
                    }
                },
                applyData: 'population',
                values: sampleData
            },
            countryClick: function (countryCode) {
                setSelectedCountry({code: countryCode, data: sampleData[countryCode]});
                setIsModalOpen(true);
            },
            onHoverOver: function (e, countryCode, countryData) {
                // Mouse üzerine gelindiğinde sınıfı ekle
                const countryElement = document.querySelector(`[data-code="${countryCode}"]`);
                countryElement.classList.add('highlighted-country');
            },
            onHoverOut: function (e, countryCode, countryData) {
                // Mouse çıkınca sınıfı kaldır
                const countryElement = document.querySelector(`[data-code="${countryCode}"]`);
                countryElement.classList.remove('highlighted-country');
            }
        });
    }, []);

    return (
        <div>
            <div id="my-svg-map"></div>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <p>Population of {selectedCountry.code}: {selectedCountry.data.population} million</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorldMap;
