
const username = prompt("Enter your name:");


const socket = io();


let currentLocation = { latitude: 0, longitude: 0 };


const markers = {};


if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        currentLocation = { latitude, longitude }; 
        socket.emit("send-location", { username, latitude, longitude }); 
    }, (error) => {
        console.error(error);
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0 // Disable caching
    });
}


const map = L.map("map").setView([0, 0], 16);


L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Swarup Tracking Map"
}).addTo(map);


const animateMarker = (marker, startLatLng, endLatLng, duration) => {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        
        const latitude = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * progress;
        const longitude = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * progress;

        marker.setLatLng([latitude, longitude]); 

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
};


socket.on("recv-location", (data) => {
    const { id, username, latitude, longitude, users } = data;

    
    map.setView([latitude, longitude]);

    
    if (markers[id]) {
        const marker = markers[id];
        const startLatLng = marker.getLatLng();
        const endLatLng = { lat: latitude, lng: longitude };
        animateMarker(marker, startLatLng, endLatLng, 1000); 
    } else {
        const marker = L.marker([latitude, longitude]).addTo(map); 
        marker.bindPopup(`<b>${username}</b>`).openPopup();
        markers[id] = marker;
    }

    
    updateUserTable(users);
});


socket.on("user-disconnected", (data) => {
    const { id, users } = data;
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
    updateUserTable(users);
});


const updateUserTable = (users) => {
    const tableBody = document.getElementById("user-list");
    tableBody.innerHTML = ""; 

    Object.values(users).forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.latitude.toFixed(6)}</td>
            <td>${user.longitude.toFixed(6)}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("connected-users").innerText = Object.keys(users).length;
};


document.getElementById("my-location-btn").addEventListener("click", () => {
    if (currentLocation.latitude && currentLocation.longitude) {
        map.setView([currentLocation.latitude, currentLocation.longitude], 16); 
    } else {
        alert("Location not Available yet.");
    }
});
