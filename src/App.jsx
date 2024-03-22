import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map.js";
import View from "ol/View.js";
import OSM from "ol/source/OSM.js";
import { Draw, Snap } from "ol/interaction.js";
import { Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import "./App.css";
// import { Polygon } from "ol/geom";

// const useMap = () => {}; logic yang dipisah bukan comp

function App() {
  const mapRef = useRef();
  const mapInstanceRef = useRef();
  const sourceRef = useRef(new VectorSource());
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [editorStatus, setEditorStatus] = useState("None");

  useEffect(function initMap() {
    if (!mapRef.current) return;

    const tile = new TileLayer({ source: new OSM() });

    tile.on("prerender", (evt) => {
      // return
      if (evt.context) {
        const context = evt.context;
        context.filter = "grayscale(80%) invert(100%) ";
        context.globalCompositeOperation = "source-over";
      }
    });

    tile.on("postrender", (evt) => {
      if (evt.context) {
        const context = evt.context;
        context.filter = "none";
      }
    });

    const vector = new VectorLayer({
      source: sourceRef.current,
      style: {
        "fill-color": "rgb(9, 96, 0, 0.5)",
        "stroke-color": "#18f400",
        "stroke-width": 2,
        "circle-radius": 7,
        "circle-fill-color": "#18f400",
      },
    });

    const map = new Map({
      layers: [tile, vector],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      target: mapRef.current,
      controls: [],
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(null);
    };
  }, []);

  const zoomOut = () => {
    const view = mapInstanceRef.current.getView();
    const zoom = view.getZoom();
    view.setZoom(zoom - 1);
  };

  const zoomIn = () => {
    const view = mapInstanceRef.current.getView();
    const zoom = view.getZoom();
    view.setZoom(zoom + 1);
  };

  const addInteraction = (type) => {
    const draw = new Draw({
      source: sourceRef.current,
      type,
    });
    mapInstanceRef.current.addInteraction(draw);
    const snap = new Snap({ source: sourceRef.current });
    mapInstanceRef.current.addInteraction(snap);
    setDrawInteraction(draw);
  };

  const toogleDrawInteraction = (type) => {
    const map = mapInstanceRef.current;
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
      setDrawInteraction(null);
      setEditorStatus("");
    } else {
      addInteraction(type);
      const snap = new Snap({ source: sourceRef.current });
      map.addInteraction(snap);
    }
  };

  console.log("rerender");

  // const polygonDrawInteraction = (type) => {
  //   const map = mapInstanceRef.current;
  //   if (drawInteraction) {
  //     map.removeInteraction(drawInteraction);
  //     setDrawInteraction(null);
  //     setEditorStatus("");
  //   } else {
  //     addInteraction("Polygon");
  //     const snap = new Snap({ source: sourceRef.current });
  //     map.addInteraction(snap);
  //   }
  // };

  // const multiLineDrawInteraction = () => {
  //   const map = mapInstanceRef.current;
  //   if (drawInteraction) {
  //     map.removeInteraction(drawInteraction);
  //     setDrawInteraction(null);
  //   } else {
  //     const draw = new Draw({
  //       source: sourceRef.current,
  //       type: "LineString",
  //     });
  //     map.addInteraction(draw);
  //     const snap = new Snap({ source: sourceRef.current });
  //     map.addInteraction(snap);
  //     setDrawInteraction(draw);
  //   }
  // };
  // const polygonDrawInteraction = () => {
  //   const map = mapInstanceRef.current;
  //   if (drawInteraction) {
  //     map.removeInteraction(drawInteraction);
  //     setDrawInteraction(null);
  //   } else {
  //     const draw = new Draw({
  //       source: sourceRef.current,
  //       type: "Polygon",
  //     });
  //     map.addInteraction(draw);
  //     const snap = new Snap({ source: sourceRef.current });
  //     map.addInteraction(snap);
  //     setDrawInteraction(draw);
  //   }
  // };

  return (
    <>
      <div>
        <div className="w-full h-screen" ref={mapRef}>
          <div className="">
            <button
              onClick={zoomIn}
              className="flex top-0 absolute z-10 bg-button p-1 m-2 rounded-md"
              id="zoomIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-zoom-in"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
                <line x1="11" x2="11" y1="8" y2="14" />
                <line x1="8" x2="14" y1="11" y2="11" />
              </svg>
            </button>
            <button
              onClick={zoomOut}
              className="flex top-10 absolute z-10 bg-button p-1 m-2  rounded-md font-bold"
              id="zoomOut"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-zoom-out"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
                <line x1="8" x2="14" y1="11" y2="11" />
              </svg>
            </button>
            <button
              onClick={() => {
                setEditorStatus("Point");
                toogleDrawInteraction("Point");
              }}
              className="flex top-30 absolute z-10 bg-button p-1 m-2 rounded-md"
            >
              {editorStatus === "Point" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-circle-stop"
                >
                  <circle cx="12" cy="12" r="10" />
                  <rect width="6" height="6" x="9" y="9" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-circle-dot"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="1" />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                setEditorStatus("LineString");
                toogleDrawInteraction("LineString");
              }}
              className="flex top-40 absolute z-10 bg-button p-1 m-2 rounded-md"
            >
              {editorStatus === "LineString" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-circle-stop"
                >
                  <circle cx="12" cy="12" r="10" />
                  <rect width="6" height="6" x="9" y="9" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-spline"
                >
                  <circle cx="19" cy="5" r="2" />
                  <circle cx="5" cy="19" r="2" />
                  <path d="M5 17A12 12 0 0 1 17 5" />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                setEditorStatus("Polygon");
                toogleDrawInteraction("Polygon");
              }}
              className="flex top-50 absolute z-10 bg-button p-1 m-2 rounded-md"
            >
              {editorStatus === "Polygon" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-circle-stop"
                >
                  <circle cx="12" cy="12" r="10" />
                  <rect width="6" height="6" x="9" y="9" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-hexagon"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
