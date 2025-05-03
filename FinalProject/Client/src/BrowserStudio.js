import React, {useState, useRef, useEffect} from "react";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import * as Tone from "tone";
import "./styles.css";

// Constant values
const ItemTypes = {SOUND: "sound"};
const NUM_TRACKS = 6;
const MAX_CELLS = 16; // e.g. 16 beats per track

// Effect Preset Options
const EFFECTS = 
{
    reverb: 
    {
        name: "Reverb",
        create: () => new Tone.Reverb(2.5).toDestination(),
        defaultSetting: {decay: 2.5, wet: 0.5},
        controls: 
        [
            {name: "Decay", param: "decay", min: 0.1, max: 10, step: 0.1, defaultValue: 2.5},
            {name: "Mix", param: "wet", min: 0, max: 1, step: 0.01, defaultValue: 0.5}
        ]
    },
    delay: 
    {
        name: "Delay",
        create: () => new Tone.FeedbackDelay("8n", 0.5).toDestination(),
        defaultSettings: {delayTime: 0.25, feedback: 0.5, wet: 0.5},
        controls: 
        [
            {name: "Time", param: "delayTime", min: 0.05, max: 1, step: 0.05, defaultValue: 0.25},
            {name: "Feedback", param: "feedback", min: 0, max: 0.9, step: 0.01, defaultValue: 0.5},
            {name: "Mix", param: "wet", min: 0, max: 1, step: 0.01, defaultValue: 0.5}
        ]
    },
    distortion: 
    {
        name: "Distortion",
        create: () => new Tone.Distortion(0.4).toDestination(),
        defaultSettings: {distortion: 0.4, wet: 0.5},
        controls: 
        [
            {name: "Amount", param: "distortion", min: 0, max: 1, step: 0.01, defaultValue: 0.4},
            {name: "Mix", param: "wet", min: 0, max: 1, step: 0.01, defaultValue: 0.5}
        ]
    },
    filter:
    {
        name: "Filter",
        create: () => new Tone.Filter(800, "lowpass").toDestination(),
        defaultSettings: {frequency: 800, type: "lowpass", Q:1},
        controls:
        [
            {name: "Frequency", param: "frequency", min: 50, max: 10000, step: 10, defaultValue: 800},
            {name: "Resonance", param: "Q", min: 0.1, max: 10, step: 0.1, defaultValue: 1}
        ]
    },
    pitch:
    {
        name: "Pitch",
        create: () => new Tone.PitchShift(0).toDestination(),
        defaultSettings: {pitch: 0, type: "pitch"},
        controls:
        [
            {name: "Pitch", param: "pitch", min: -12, max: 12, step: 1, defaultValue: 0}
        ]
    }
};

// Global Effects Instances
const effectsInstances = {};
Object.keys(EFFECTS).forEach((effectType) =>
{
    effectsInstances[effectType] = EFFECTS[effectType].create();
});

// Sound manager which handles all Tone.js players
const soundManager =
{
    players: {},
    buffers: {},

    // Initialize a sound 
    initSound: function(sound)
    {
        if (!this.players[sound.id])
        {
            // Create buffer if needed
            if (!this.buffers[sound.url])
            {
                this.buffers[sound.url] = new Tone.Buffer(sound.url);
            }

            // Create a player connected to master output
            this.players[sound.id] = new Tone.Player(this.buffers[sound.url]).toDestination();
        }
        return this.players[sound.id];
    },

    // Play a sound with effects
    playSound: function(sound, effects = [], effectSettings = {})
    {
        try 
        {
            if (!sound) return;

            const player = this.initSound(sound);

            // Disconnect from any previous connections
            player.disconnect();

            // If no effects, connect directly to destination
            if (effects.length === 0)
            {
                player.toDestination();
            }
            else
            {
                // Chain through the selected effects
                let chain = player;
                effects.forEach(effectType =>
                {
                    
                    if (effectsInstances[effectType])
                    {
                        // Apply effect settings if provided
                        if (effectSettings[effectType])
                        {
                            Object.entries(effectSettings[effectType]).forEach(([param, value]) => 
                            {
                                if (effectsInstances[effectType][param] !== undefined)
                                {
                                    if (typeof effectsInstances[effectType][param] == 'object' &&
                                        typeof effectsInstances[effectType][param].value !== 'undefined') 
                                        {
                                            effectsInstances[effectType][param].value = value;
                                        }
                                        else
                                        {
                                            effectsInstances[effectType][param] = value;
                                        }
                                }
                            });
                        }
                        chain = chain.connect(effectsInstances[effectType]);
                    }
                });
            }
            // Play the sound 
            player.start();
        }
        catch(error)
        {
            console.error("Error playing sound:", error);
        }
    }
}

// Effect Control Panel for an individual cell
function EffectControls({ cellEffects, setCellEffects, selectedCell, effectSettings, setEffectSettings }) {
  if (!selectedCell) {
    return <div className="effects-panel">Select a sound in the timeline to apply effects</div>;
  }

  const { trackIndex, cellIndex } = selectedCell;
  
  const handleEffectToggle = (effectType) => {
    setCellEffects(prev => {
      const newEffects = JSON.parse(JSON.stringify(prev));
      
      if (!newEffects[trackIndex]) {
        newEffects[trackIndex] = [];
      }
      
      if (!newEffects[trackIndex][cellIndex]) {
        newEffects[trackIndex][cellIndex] = [];
      }
      
      const currentEffects = newEffects[trackIndex][cellIndex];
      
      if (currentEffects.includes(effectType)) {
        // Remove effect
        newEffects[trackIndex][cellIndex] = currentEffects.filter(e => e !== effectType);
      } else {
        // Add effect
        newEffects[trackIndex][cellIndex] = [...currentEffects, effectType];
        
        // Initialize effect settings for this cell if not already set
        setEffectSettings(prev => {
          const newSettings = {...prev};
          if (!newSettings[trackIndex]) newSettings[trackIndex] = {};
          if (!newSettings[trackIndex][cellIndex]) newSettings[trackIndex][cellIndex] = {};
          if (!newSettings[trackIndex][cellIndex][effectType]) {
            newSettings[trackIndex][cellIndex][effectType] = {...EFFECTS[effectType].defaultSettings};
          }
          return newSettings;
        });
      }
      
      return newEffects;
    });
  };

  const handleEffectParamChange = (effectType, param, value) => {
    setEffectSettings(prev => {
      const newSettings = {...prev};
      if (!newSettings[trackIndex]) newSettings[trackIndex] = {};
      if (!newSettings[trackIndex][cellIndex]) newSettings[trackIndex][cellIndex] = {};
      if (!newSettings[trackIndex][cellIndex][effectType]) {
        newSettings[trackIndex][cellIndex][effectType] = {...EFFECTS[effectType].defaultSettings};
      }
      
      newSettings[trackIndex][cellIndex][effectType][param] = parseFloat(value);
      
      // Update effect instance parameter for immediate feedback
      if (effectsInstances[effectType]) {
        try {
          if (typeof effectsInstances[effectType][param] === 'object' && 
              typeof effectsInstances[effectType][param].value !== 'undefined') {
            effectsInstances[effectType][param].value = parseFloat(value);
          } else {
            effectsInstances[effectType][param] = parseFloat(value);
          }
        } catch (error) {
          console.error(`Error setting ${param} for ${effectType}:`, error);
        }
      }
      
      return newSettings;
    });
  };

  const currentEffects = cellEffects[trackIndex]?.[cellIndex] || [];
  const currentSettings = effectSettings[trackIndex]?.[cellIndex] || {};

  return (
    <div className="effects-panel" style={{ marginTop: 20 }}>
      <h3>Effects for Sound at Track {trackIndex + 1}, Cell {cellIndex + 1}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {Object.keys(EFFECTS).map(effectType => (
          <button
            key={effectType}
            onClick={() => handleEffectToggle(effectType)}
            style={{
              padding: "6px 12px",
              backgroundColor: currentEffects.includes(effectType) ? "#a0d3ff" : "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {EFFECTS[effectType].name}
          </button>
        ))}
      </div>
      
      {/* Effect parameter sliders */}
      {currentEffects.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <h4>Effect Parameters</h4>
          {currentEffects.map(effectType => (
            <div key={effectType} style={{ marginBottom: "16px", padding: "12px", border: "1px solid #ddd", borderRadius: "4px" }}>
              <h5 style={{ margin: "0 0 8px 0" }}>{EFFECTS[effectType].name}</h5>
              {EFFECTS[effectType].controls.map(control => (
                <div key={control.param} style={{ marginBottom: "8px" }}>
                  <label style={{ display: "block", marginBottom: "4px" }}>
                    {control.name}: {currentSettings[effectType]?.[control.param]?.toFixed(2) || control.defaultValue}
                  </label>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={currentSettings[effectType]?.[control.param] || control.defaultValue}
                    onChange={(e) => handleEffectParamChange(effectType, control.param, e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Draggable Sound Item
function SoundItem({ sound }) {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.SOUND,
    item: { sound },
  }));

  const handlePreview = (e) => {
    e.stopPropagation(); // Prevents triggering drag accidentally
    soundManager.playSound(sound);
  };

  return (
    <div
      ref={drag}
      style={{
        border: "1px solid gray",
        padding: 6,
        margin: 4,
        backgroundColor: "#f9f9f9",
        cursor: "grab",
        textAlign: "center",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{sound.name}</span>
      <button
        onClick={handlePreview}
        style={{
          marginLeft: 8,
          padding: "2px 6px",
          cursor: "pointer",
          fontSize: 12,
          backgroundColor: "#eee",
          border: "1px solid #ccc",
          borderRadius: 4,
        }}
      >
        ▶
      </button>
    </div>
  );
}

// Sound List
function SoundList({ sounds }) {
  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = (categoryName) => {
    setOpenCategory((prev) => (prev === categoryName ? null : categoryName));
  };
  
  return (
    <div>
      {Object.entries(sounds).map(([categoryName, soundList]) => (
        <div key={categoryName} style={{ marginBottom: 12 }}>
          <div
            onClick={() => toggleCategory(categoryName)}
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              backgroundColor: "#ddd",
              padding: 6,
              borderRadius: 4,
            }}
          >
            {categoryName} {openCategory === categoryName ? "▲" : "▼"}
          </div>
          {openCategory === categoryName && (
            <div style={{ paddingLeft: 10 }}>
              {soundList.map((sound) => (
                <SoundItem key={sound.id} sound={sound} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Timeline Cell
function TimelineCell({ trackIndex, cellIndex, item, onDrop, isActive, onRemove, isSelected, onSelect, hasEffects }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.SOUND,
    drop: (draggedItem) => {
      onDrop(trackIndex, cellIndex, draggedItem.sound, draggedItem.from);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SOUND,
    item: { sound: item, from: { trackIndex, cellIndex } },
    canDrag: !!item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleRightClick = (e) => {
    e.preventDefault();
    if (item) {
      onRemove(trackIndex, cellIndex);
    }
  };

  // Handle cell click to select it
  const handleClick = () => {
    if (item) {
      onSelect(trackIndex, cellIndex);
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      style={{
        width: 80,
        height: 50,
        border: isActive 
          ? "2px solid red" 
          : isSelected 
            ? "2px solid #4a90e2" 
            : "1px solid #ccc",
        backgroundColor: isOver 
          ? "#e0f7ff" 
          : isDragging 
            ? "#f0f0f0" 
            : isSelected 
              ? "#edf5ff" 
              : "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        overflow: "hidden",
        cursor: item ? "pointer" : "default",
        position: "relative"
      }}
    >
      {item?.name}
      {hasEffects && (
        <div style={{ 
          position: "absolute", 
          top: 2, 
          right: 2, 
          width: 8, 
          height: 8, 
          borderRadius: "50%", 
          backgroundColor: "#4a90e2" 
        }} />
      )}
    </div>
  );
}

function Timeline({ grid, setGrid, playhead, selectedCell, setSelectedCell, cellEffects, onUndo, onClear }) {
  const handleDrop = (targetTrack, targetCell, sound, from) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);

      // If the drop is from another timeline cell, clear original position
      if (from) {
        newGrid[from.trackIndex][from.cellIndex] = null;
      }

      // Place the sound in the new cell
      newGrid[targetTrack][targetCell] = { ...sound };

      return newGrid;
    });
  };

  const handleRemove = (track, cell) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);
      newGrid[track][cell] = null;
      return newGrid;
    });
    
    // Clear selected cell if it was the one we just removed
    if (selectedCell && selectedCell.trackIndex === track && selectedCell.cellIndex === cell) {
      setSelectedCell(null);
    }
  };

  const handleCellSelect = (trackIndex, cellIndex) => {
    if (selectedCell && selectedCell.trackIndex === trackIndex && selectedCell.cellIndex === cellIndex) {
      setSelectedCell(null); // Deselect if already selected
    } else {
      setSelectedCell({ trackIndex, cellIndex });
    }
  };

  // Check if a cell has effects
  const cellHasEffects = (trackIndex, cellIndex) => {
    return cellEffects[trackIndex]?.[cellIndex]?.length > 0;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Timeline</h3>
        <div>
          <button 
            onClick={onUndo}
            style={{ 
              marginRight: 10, 
              padding: "5px 10px", 
              backgroundColor: "#f0f0f0", 
              border: "1px solid #ccc", 
              borderRadius: 4, 
              cursor: "pointer" 
            }}
          >
            Undo Last Drop
          </button>
          <button 
            onClick={onClear}
            style={{ 
              padding: "5px 10px", 
              backgroundColor: "#ff9800", 
              color: "white", 
              border: "none", 
              borderRadius: 4, 
              cursor: "pointer" 
            }}
          >
            Clear Timeline
          </button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex" }}>
              <div 
                style={{
                  width: 60,
                  marginRight: 10,
                  padding: "0 8px",
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f0f0f0",
                  borderRadius: 4,
                }}
              >
                Track {rowIndex + 1}
              </div>
              {row.map((cell, colIndex) => (
                <TimelineCell
                  key={`${rowIndex}-${colIndex}`}
                  trackIndex={rowIndex}
                  cellIndex={colIndex}
                  item={cell}
                  onDrop={handleDrop}
                  onRemove={handleRemove}
                  isActive={colIndex === playhead}
                  isSelected={selectedCell && selectedCell.trackIndex === rowIndex && selectedCell.cellIndex === colIndex}
                  onSelect={handleCellSelect}
                  hasEffects={cellHasEffects(rowIndex, colIndex)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Player with Playhead
function Player({ grid, setPlayhead, playhead, cellEffects, effectSettings }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const sequenceRef = useRef(null);

  // Update BPM when slider changes
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  // Stop playback and reset
  const stopPlayback = () => {
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }
    Tone.Transport.stop();
    setPlayhead(-1);
    setIsPlaying(false);
  };

  // Start the playback
  const playTimeline = async () => {
    // Stop previous playback if any
    stopPlayback();
    
    // Initialize Tone.js if needed
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    // Create a sequence
    const sequence = new Tone.Sequence(
      (time, beat) => {
        setPlayhead(beat);
        
        // Play all sounds for this beat
        for (let track = 0; track < NUM_TRACKS; track++) {
          const sound = grid[track][beat];
          if (sound) {
            // Apply cell-specific effects when playing the sound
            const activeEffects = cellEffects[track]?.[beat] || [];
            const settings = effectSettings[track]?.[beat] || {};
            soundManager.playSound(sound, activeEffects, settings);
          }
        }
      },
      Array.from({ length: MAX_CELLS }, (_, i) => i),
      "8n" // eighth note subdivision
    ).start(0);
    
    sequenceRef.current = sequence;
    
    // Start the transport
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.start();
    setIsPlaying(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }
      Tone.Transport.stop();
    };
  }, []);

  const handleBpmChange = (e) => {
    const newBpm = parseInt(e.target.value);
    setBpm(newBpm);
  };

  return (
    <div style={{ marginTop: 20 }}>
      {!isPlaying ? (
        <button 
          onClick={playTimeline} 
          style={{ padding: 10, backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: 4, cursor: "pointer", marginRight: 10 }}
        >
          Play
        </button>
      ) : (
        <button 
          onClick={stopPlayback} 
          style={{ padding: 10, backgroundColor: "#f44336", color: "white", border: "none", borderRadius: 4, cursor: "pointer", marginRight: 10 }}
        >
          Stop
        </button>
      )}
      
      <div style={{ marginTop: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 60 }}>BPM: {bpm}</span>
          <input
            type="range"
            min="60"
            max="200"
            step="1"
            value={bpm}
            onChange={handleBpmChange}
            style={{ flex: 1 }}
            disabled={isPlaying}
          />
        </div>
      </div>
      
      {playhead >= 0 && <span style={{ marginLeft: 20 }}>Beat: {playhead + 1}</span>}
    </div>
  );
}

// Main Component
export default function BrowserStudio() {
  const [grid, setGrid] = useState(
    Array.from({ length: NUM_TRACKS }, () =>
      Array(MAX_CELLS).fill(null)
    )
  );
  const [playhead, setPlayhead] = useState(-1);
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellEffects, setCellEffects] = useState([]); // 2D array [track][cell] = [effects]
  const [effectSettings, setEffectSettings] = useState({}); // 3D object [track][cell][effectType] = {params}
  
  // History state for undo functionality
  const [history, setHistory] = useState([]);

  // Update history when grid changes
  useEffect(() => {
    // Save current state to history when grid changes
    // But avoid adding empty grids to history
    const isEmpty = grid.every(row => row.every(cell => cell === null));
    if (!isEmpty) {
      setHistory(prev => [...prev, JSON.stringify(grid)]);
    }
  }, [grid]);

  // Undo last drop
  const handleUndo = () => {
    if (history.length > 1) {
      // Get the previous state (excluding the current state)
      const previousHistory = [...history];
      previousHistory.pop(); // Remove current state
      const previousState = previousHistory[previousHistory.length - 1];
      
      // Set the grid to the previous state
      setGrid(JSON.parse(previousState));
      
      // Update history
      setHistory(previousHistory);
    } else if (history.length === 1) {
      // If there's only one state in history, clear the grid
      setGrid(Array.from({ length: NUM_TRACKS }, () => Array(MAX_CELLS).fill(null)));
      setHistory([]);
    }
  };

  // Clear timeline
  const handleClearTimeline = () => {
    if (window.confirm("Are you sure you want to clear the entire timeline?")) {
      setGrid(Array.from({ length: NUM_TRACKS }, () => Array(MAX_CELLS).fill(null)));
      setCellEffects([]);
      setEffectSettings({});
      setSelectedCell(null);
      setHistory([]);
    }
  };

  // Initialize Tone.js
  useEffect(() => {
    // Preload all buffers for faster playback
    Tone.start();
    
    return () => {
      // Clean up when component unmounts
      Tone.Transport.stop();
    };
  }, []);

  const sounds = 
  {
    Drums: 
    [
      { id: 1, name: "Kick", url: "/sounds/kick.wav" },
      { id: 2, name: "Snare", url: "/sounds/snare.wav" },
      { id: 3, name: "Hi-Hat", url: "/sounds/hihat.wav" },
    ],
    Bass: 
    [
      { id: 4, name: "808", url: "/sounds/808.wav" },
      { id: 5, name: "Sub Bass", url: "/sounds/subbass.wav" },
    ],
    Synths: 
    [
      { id: 6, name: "Pad", url: "/sounds/pad.wav" },
      { id: 7, name: "Lead", url: "/sounds/lead.wav" },
    ],
    Piano: 
    [
      
    ]
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
        <h2>Browser Studio</h2>
        <div style={{ display: "flex", gap: 40 }}>
          <div style={{ width: 220 }}>
            <h3>Sound Library</h3>
            <SoundList sounds={sounds} />
          </div>
          <div style={{ flex: 1 }}>
            <Timeline 
              grid={grid} 
              setGrid={setGrid} 
              playhead={playhead} 
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              cellEffects={cellEffects}
              onUndo={handleUndo}
              onClear={handleClearTimeline}
            />
            <Player 
              grid={grid} 
              setPlayhead={setPlayhead} 
              playhead={playhead}
              cellEffects={cellEffects}
              effectSettings={effectSettings}
            />
            <div style={{ marginTop: 20 }}>
              <EffectControls 
                cellEffects={cellEffects}
                setCellEffects={setCellEffects}
                selectedCell={selectedCell}
                effectSettings={effectSettings}
                setEffectSettings={setEffectSettings}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}