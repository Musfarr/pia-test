import { useEffect, useRef, useState } from 'react';
import {
  ConnectionState,
  Room,
  Track,
  createLocalAudioTrack,
} from 'livekit-client';
import { createSession } from '../services/api';
import api from '../services/api';
import './LiveDemo.css';

export default function LiveDemo() {
  const roomRef = useRef(null);
  const remoteAudioContainerRef = useRef(null);
  const [status, setStatus] = useState('Idle');
  const [logs, setLogs] = useState([]);
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

  const appendLog = (message) => {
    setLogs((prev) => [message, ...prev].slice(0, 30));
  };

  const detachAllTracks = () => {
    const room = roomRef.current;
    if (!room) return;
    room.participants.forEach((participant) => {
      participant.tracks.forEach((pub) => {
        pub.track?.detach().forEach((el) => el.remove());
      });
    });
    room.localParticipant.tracks.forEach((pub) => {
      pub.track?.detach().forEach((el) => el.remove());
    });
    remoteAudioContainerRef.current?.replaceChildren();
  };

  const leaveRoom = async () => {
    const room = roomRef.current;
    if (room) {
      room.disconnect();
      detachAllTracks();
      roomRef.current = null;
    }
    setJoined(false);
    setStatus('Idle');
  };

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, []);

  const joinRoom = async () => {
    setIsJoining(true);
    setError(null);
    appendLog('Requesting session token...');
    setStatus('Requesting token');

    try {
      const result = await createSession();
      const data = result.data;
      console.log(data , ":dadaatatata");
      appendLog(`Received token for room ${data.room_name}`);
      setStatus('Connecting to room');

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        reconnectPolicy: {
          maxRetries: 3,
          retryDelays: [1000, 2000, 4000],
        },
      });

      room.on('connectionStateChanged', (state) => {
        setStatus(`Connection: ${state}`);
        appendLog(`🔄 Connection state: ${state}`);
        if (state === ConnectionState.Disconnected) {
          setJoined(false);
          setError('Call Disconnected');
        }
      });

      room.on('connectionQualityChanged', (quality, participant) => {
        console.log(`📶 Connection quality: ${quality} for ${participant?.identity || 'local'}`);
      });

      room.on('reconnecting', () => {
        appendLog('🔄 Reconnecting to server...');
        setStatus('Reconnecting...');
      });

      room.on('reconnected', () => {
        appendLog('✅ Reconnected successfully');
        setStatus('Reconnected');
      });

      room.on('disconnected', (reason) => {
        appendLog(`🚪 Disconnected from room: ${reason}`);
      });

      room.on('trackSubscribed', (track, publication, participant) => {
        appendLog(`Subscribed to ${track.kind} from ${participant.identity}`);
        if (track.kind === Track.Kind.Audio) {
          const audioEl = track.attach();
          audioEl.autoplay = true;
          audioEl.controls = true;
          remoteAudioContainerRef.current?.appendChild(audioEl);
        }
      });

      room.on('trackUnsubscribed', (track) => {
        appendLog(`Track unsubscribed (${track.kind})`);
        track.detach().forEach((el) => el.remove());
      });

      roomRef.current = room;

      appendLog('🔌 Attempting to connect to room...');
      const connectPromise = room.connect(data.livekit_url, data.access_token, {
        autoSubscribe: true,
        rtcConfig: {
          iceTransportPolicy: 'all',
          bundlePolicy: 'max-bundle',
          rtcpMuxPolicy: 'require',
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout after 30 seconds. Please check your network or firewall settings.')), 30000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      appendLog('Connected to room');
      setStatus('Connected — creating mic track');

      const localAudioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      appendLog('Microphone captured');

      await room.localParticipant.publishTrack(localAudioTrack);
      appendLog('Microphone published');

      // Start recording
      try {
        const recordingResult = await api.post('sessions/start-recording', {
          room_name: data.room_name
        });
        
        if (recordingResult.data.status) {
          appendLog(`🎙️ Recording started: ${recordingResult.data.data.filename}`);
        } else {
          appendLog(`⚠️ Recording warning: ${recordingResult.data.message}`);
        }
      } catch (recErr) {
        console.error("Failed to start recording:", recErr);
        appendLog(`❌ Recording Error: ${recErr.message}`);
      }

      setJoined(true);
      setStatus('Live — talking to agent');
    } catch (err) {
      let message = err?.message ?? 'Join failed';
      if (message.toLowerCase().includes('timeout')) {
        message = '⏱️ Connection timeout. Your network may be blocking WebRTC. Try: 1) Check firewall settings, 2) Use a different network, 3) Contact IT support if on corporate network.';
      } else if (message.toLowerCase().includes('ice') || message.toLowerCase().includes('peer connection')) {
        message = '🔌 Unable to establish peer connection. This usually happens due to: 1) Strict firewall/NAT, 2) Corporate network restrictions, 3) VPN interference. Try disabling VPN or switching networks.';
      } else if (message.toLowerCase().includes('permission')) {
        message = '🎤 Microphone access denied. Please allow microphone permissions in your browser settings.';
      }
      setError(message);
      appendLog(`Error: ${message}`);
      await leaveRoom();
    } finally {
      setIsJoining(false);
    }
  };

  const statusLabel = joined
    ? 'Live with agent'
    : isJoining
      ? 'Connecting…'
      : 'Ready to call';

  const statusClass = joined
    ? 'call-status call-status--live'
    : isJoining
      ? 'call-status call-status--joining'
      : 'call-status';

  const micClass = joined
    ? 'mic-visual mic-visual--live'
    : isJoining
      ? 'mic-visual mic-visual--joining'
      : 'mic-visual';

  return (
    <div className="call-stage">
      <div className="call-card">
        <h4 className="call-card__title">Voice Agent</h4>
        <p className="call-card__subtitle">Tap to start a conversation</p>

        <span className={statusClass}>
          <span className="call-status__dot" />
          {statusLabel}
        </span>

        <div className={micClass}>
          <span className="mic-ring" />
          <span className="mic-ring" />
          <span className="mic-ring" />
          <span className="mic-ring" />
          <div className="mic-orb">
            <i className={`bi ${joined ? 'bi-mic-fill' : 'bi-mic'}`} />
          </div>
        </div>

        <div className={`wave-bars ${joined ? 'wave-bars--live' : ''}`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="wave-bar" />
          ))}
        </div>

        <div>
          {!joined ? (
            <button
              className="call-btn call-btn--start"
              onClick={joinRoom}
              disabled={isJoining}
              aria-label="Start call"
              title="Start call"
            >
              <i className="bi bi-telephone-fill" />
            </button>
          ) : (
            <button
              className="call-btn call-btn--end"
              onClick={() => leaveRoom()}
              aria-label="End call"
              title="End call"
            >
              <i className="bi bi-telephone-x-fill" />
            </button>
          )}
          <span className="call-btn-label">
            {joined ? 'End Call' : isJoining ? 'Joining…' : 'Start Call'}
          </span>
        </div>

        {error && <div className="call-error">{error}</div>}

        <button
          className="log-toggle"
          onClick={() => setShowLogs((v) => !v)}
          type="button"
        >
          <i className={`bi bi-chevron-${showLogs ? 'up' : 'down'}`} />
          {showLogs ? 'Hide activity' : 'Show activity'}
        </button>
      </div>

      {showLogs && (
        <div className="log-panel">
          <div className="log-panel__title">Activity</div>
          {logs.length === 0 ? (
            <div className="log-empty">No activity yet</div>
          ) : (
            <ul className="log-list">
              {logs.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Hidden but functional remote audio sink */}
      <div ref={remoteAudioContainerRef} className="remote-audio-hidden" aria-hidden="true" />
    </div>
  );
}
