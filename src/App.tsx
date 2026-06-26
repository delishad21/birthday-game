import BirthdayGame from './components/BirthdayGame';
import BeatmapEditor from './components/BeatmapEditor';
import './App.css';

export default function App() {
  const tool = new URLSearchParams(window.location.search).get('tool');
  if (tool === 'beatmap') {
    return <BeatmapEditor />;
  }

  return <BirthdayGame />;
}
