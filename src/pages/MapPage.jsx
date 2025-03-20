import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer } from "ol/layer";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Draw, Modify, Snap } from "ol/interaction";
import { getArea, getLength } from "ol/sphere";
import { Polygon } from "ol/geom";

const MapPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonStats, setPolygonStats] = useState([]);

  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const vectorSourceRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) setName(userData.name);

    const baseLayer = new TileLayer({ source: new OSM() });
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;
    const vectorLayer = new VectorLayer({ source: vectorSource });

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, vectorLayer],
      view: new View({ center: fromLonLat([0, 0]), zoom: 2 }),
    });

    mapInstanceRef.current = map;

    
    const modify = new Modify({ source: vectorSource });

    
    modify.on("modifyend", (event) => {
      const modifiedFeatures = event.features.getArray();

      setPolygonStats((prevStats) => {
        const updatedStats = [...prevStats];

        modifiedFeatures.forEach((feature) => {
          const polygon = feature.getGeometry();
          const featureId = feature.ol_uid; 

          const index = updatedStats.findIndex((stat) => stat.id === featureId);
          const newStats = {
            id: featureId,
            area: getArea(polygon),
            perimeter: getLength(polygon.getLinearRing(0)),
          };

          if (index !== -1) {
            updatedStats[index] = newStats; 
          } else {
            updatedStats.push(newStats); 
          }
        });

        return updatedStats;
      });
    });

    const snap = new Snap({ source: vectorSource });

    map.addInteraction(modify);
    map.addInteraction(snap);

    return () => map.setTarget(null);
  }, []);

  const toggleDrawing = () => {
    if (!isDrawing) {
      const draw = new Draw({ source: vectorSourceRef.current, type: "Polygon" });

      draw.on("drawend", (event) => {
        const polygon = event.feature.getGeometry();
        const featureId = event.feature.ol_uid; 
        addPolygonStats(polygon, featureId);
      });

      mapInstanceRef.current.addInteraction(draw);
      drawRef.current = draw;
    } else {
      mapInstanceRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }
    setIsDrawing(!isDrawing);
  };

  const undoLastPolygon = () => {
    const features = vectorSourceRef.current.getFeatures();
    if (features.length > 0) {
      const lastFeature = features[features.length - 1];
      vectorSourceRef.current.removeFeature(lastFeature);

      setPolygonStats((prevStats) => prevStats.filter((stat) => stat.id !== lastFeature.ol_uid));
    }
  };

  const addPolygonStats = (polygon, id) => {
    if (polygon instanceof Polygon) {
      const area = getArea(polygon);
      const perimeter = getLength(polygon.getLinearRing(0));

      setPolygonStats((prevStats) => [...prevStats, { id, area, perimeter }]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", width: "100vw" }}>
      <h1 style={{ textAlign: "center", margin: "20px 0" }}>{name || "User"}</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          onClick={() => navigate("/")}
          style={{ padding: "10px 15px", fontSize: "16px", cursor: "pointer", background: "red", color: "white" }}
        >
          ⬅ Back
        </button>
        <button
          onClick={toggleDrawing}
          style={{ padding: "10px 15px", fontSize: "16px", cursor: "pointer" }}
        >
          {isDrawing ? "Stop Drawing" : "Start Drawing a Polygon"}
        </button>
        <button
          onClick={undoLastPolygon}
          style={{ padding: "10px 15px", fontSize: "16px", cursor: "pointer" }}
        >
          Undo Last Polygon
        </button>
      </div>

      <div ref={mapRef} style={{ width: "80vw", minHeight: "70vh", border: "2px solid black" }}></div>

      <p style={{ color: "gray", fontSize: "14px", marginBottom: "10px" }}>
        ✏️ You can edit the polygons by dragging their sides.
      </p>

      {polygonStats.length > 0 && (
        <div style={{ marginTop: "10px", padding: "10px", borderRadius: "5px" }}>
          <p><strong>👇🏼 Measurements:</strong></p>
          {polygonStats.map((stats, index) => (
            <p key={stats.id}>
              🔹 <strong>Polygon {index + 1}:</strong> Perimeter: {stats.perimeter.toFixed(2)}m, Area: {stats.area.toFixed(2)}m²
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapPage;
