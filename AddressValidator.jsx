// import React, { useState } from "react";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const AddressValidator = () => {
//     const [address, setAddress] = useState("");
//     const [result, setResult] = useState("");

//     const giveCoordinates = async (location) => {
//         try {
//             const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
//             const response = await fetch(geocodingUrl);
//             const data = await response.json();

//             if (data && data.length > 0) {
//                 const latitude = parseFloat(data[0].lat);
//                 const longitude = parseFloat(data[0].lon);

//                 if (!isNaN(latitude) && !isNaN(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
//                     return [latitude, longitude];
//                 }
//             }

//             const genAI = new GoogleGenerativeAI("AIzaSyDnHUOrPPdbli788qhCbNnnEbSu-EKxGG0");
//             const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//             const prompt = `Give me ONLY the exact latitude and longitude coordinates for ${location} in decimal degrees format.`;
            
//             const result = await model.generateContent(prompt);
//             const response2 = await result.response;
//             const text = await response2.text();

//             const cardinalRegex = /([\d.-]+)°\s*[NSns],\s*([\d.-]+)°\s*[EWew]/i;
//             const cardinalMatch = text.match(cardinalRegex);

//             if (cardinalMatch) {
//                 const latitude = parseFloat(cardinalMatch[1]);
//                 const longitude = parseFloat(cardinalMatch[2]);
//                 if (!isNaN(latitude) && !isNaN(longitude)) {
//                     return [latitude, longitude];
//                 }
//             }

//             throw new Error("Could not find valid coordinates");
//         } catch (error) {
//             console.error(`Error finding coordinates for ${location}:`, error);
//             throw error;
//         }
//     };

//     const validateAddress = async () => {
//         if (!address) {
//             setResult("Please enter an address.");
//             return;
//         }
        
//         try {
//             const coordinates = await giveCoordinates(address);
//             setResult(`Valid Address! Coordinates: ${coordinates[0]}, ${coordinates[1]}`);
//         } catch (error) {
//             setResult("Invalid address or could not find coordinates.");
//         }
//     };

//     return (
//         <div>
//             <h2>Enter Address to Validate</h2>
//             <input 
//                 type="text" 
//                 value={address} 
//                 onChange={(e) => setAddress(e.target.value)} 
//                 placeholder="Enter an address" 
//             />
//             <button onClick={validateAddress}>Check Address</button>
//             <p>{result}</p>
//         </div>
//     );
// };

// export default AddressValidator;


import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyAL7SL4j9usFe3z8cVsPaITVg8JMfKPZnw";

async function giveCoordinates(location) {
    try {
        // Try getting coordinates via Geocoding API
        const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
        const response = await fetch(geocodingUrl);
        const data = await response.json();

        if (data && data.length > 0) {
            const latitude = parseFloat(data[0].lat);
            const longitude = parseFloat(data[0].lon);

            // Validate coordinates
            if (!isNaN(latitude) && !isNaN(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
                console.log(`Found coordinates for ${location}: ${latitude}, ${longitude}`);
                return [latitude, longitude];
            }
        }

        // If OpenStreetMap fails, try Google Generative AI API as backup
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" }); // Use the correct model name

        const prompt = `Give me ONLY the exact latitude and longitude coordinates for ${location} in decimal degrees format (e.g. 12.9716° N, 77.5946° E). Provide coordinates for the nearest identifiable location if exact match not found.`;

        const result = await model.generateContent(prompt);
        const response2 = await result.response;
        const text = await response2.text();

        // Parse coordinates from response
        const cardinalRegex = /([\d.-]+)°\s*[NSns],\s*([\d.-]+)°\s*[EWew]/i;
        const cardinalMatch = text.match(cardinalRegex);

        if (cardinalMatch) {
            const latitude = parseFloat(cardinalMatch[1]);
            const longitude = parseFloat(cardinalMatch[2]);
            if (!isNaN(latitude) && !isNaN(longitude)) {
                console.log(`Found coordinates via Gemini for ${location}: ${latitude}, ${longitude}`);
                return [latitude, longitude];
            }
        }

        // Final attempt to extract any valid looking coordinates
        const numberRegex = /([-+]?\d+\.?\d*)/g;
        const matches = text.match(numberRegex);

        if (matches && matches.length >= 2) {
            const latitude = parseFloat(matches[0]);
            const longitude = parseFloat(matches[1]);

            if (!isNaN(latitude) && !isNaN(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
                console.log(`Extracted coordinates for ${location}: ${latitude}, ${longitude}`);
                return [latitude, longitude];
            }
        }

        throw new Error("Could not find valid coordinates for the location");
    } catch (error) {
        console.error(`Error finding coordinates for ${location}:`, error);
        throw error;
    }
}

function LocationForm() {
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const coords = await giveCoordinates(address);
            setCoordinates(coords);
            setError('');
        } catch (err) {
            setError('Failed to fetch coordinates. Please try again.');
            setCoordinates(null);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address"
                    required
                />
                <button type="submit">Get Coordinates</button>
            </form>
            {coordinates && (
                <div>
                    <p>valid address</p>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default LocationForm;