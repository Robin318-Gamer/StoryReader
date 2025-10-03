import React, { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  src: string | null;
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = speed;
    }
  }, [volume, speed]);

  useEffect(() => {
    setCurrentTime(0);
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [src]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(Number(e.target.value));
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setCurrentTime(Number(e.target.value));
    }
  };

  const handleFastForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: '100%' }}>
      <audio
        ref={audioRef}
        src={src || undefined}
        onEnded={() => { setPlaying(false); onEnded && onEnded(); }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        style={{ display: 'none' }}
      />
      {/* Playback Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%' }}>
        <button 
          onClick={handleRewind} 
          disabled={!src} 
          title="Rewind 10s"
          style={{ padding: '8px 12px', fontSize: 18, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 6, background: '#fff', minWidth: 44, minHeight: 44 }}
        >
          ⏪
        </button>
        <button 
          onClick={handlePlayPause} 
          disabled={!src} 
          style={{ padding: '8px 16px', fontSize: 20, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 6, background: '#fff', minWidth: 44, minHeight: 44 }}
        >
          {playing ? '⏸️' : '▶️'}
        </button>
        <button 
          onClick={handleFastForward} 
          disabled={!src} 
          title="Forward 10s"
          style={{ padding: '8px 12px', fontSize: 18, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 6, background: '#fff', minWidth: 44, minHeight: 44 }}
        >
          ⏩
        </button>
        <span style={{ fontSize: 12, minWidth: 70, textAlign: 'center', color: '#666' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
      
      {/* Seek Bar */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.01}
        value={currentTime}
        onChange={handleSeek}
        style={{ width: '100%', maxWidth: '100%', cursor: 'pointer' }}
        disabled={!src}
      />
      
      {/* Volume and Speed Controls - Stacked on Mobile */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: '100%' }}>
        {/* Volume Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          <label style={{ fontSize: 12, minWidth: 50, flexShrink: 0 }}>Volume</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={handleVolumeChange} 
            style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} 
          />
          <span style={{ fontSize: 12, minWidth: 40, textAlign: 'right', flexShrink: 0 }}>{Math.round(volume * 100)}%</span>
        </div>
        
        {/* Speed Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          <label style={{ fontSize: 12, minWidth: 50, flexShrink: 0 }}>Speed</label>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.05" 
            value={speed} 
            onChange={handleSpeedChange} 
            style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} 
          />
          <span style={{ fontSize: 12, minWidth: 40, textAlign: 'right', flexShrink: 0 }}>{speed.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};

function formatTime(time: number) {
  if (isNaN(time)) return '0:00';
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
