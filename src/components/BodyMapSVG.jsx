import Model from 'react-body-highlighter'

const MUSCLE_MAP = {
  'chest':         'chest',
  'triceps':       'triceps',
  'biceps':        'biceps',
  'abs':           'abs',
  'quads':         'quadriceps',
  'calves':        'calves',
  'forearms':      'forearm',
  'traps':         'trapezius',
  'lats':          'upper-back',
  'lower-back':    'lower-back',
  'glutes':        'gluteal',
  'hamstrings':    'hamstring',
  'front-deltoid': 'front-deltoids',
  'rear-deltoid':  'back-deltoids',
  'tibialis':      'quadriceps',
}

export default function BodyMapSVG({ activeMuscles = [] }) {
  const mapped = [...new Set(
    activeMuscles.map((m) => MUSCLE_MAP[m]).filter(Boolean)
  )]

  const data = [{ name: 'Workout', muscles: mapped }]

  return (
    <div className="flex justify-center gap-6">
      <div className="flex flex-col items-center">
        <Model
          data={data}
          style={{ width: '10rem' }}
          type="anterior"
          highlightedColors={['#3B82F6']}
          bodyColor="#D1D5DB"
        />
        <span className="text-xs text-gray-500 mt-1">Front</span>
      </div>
      <div className="flex flex-col items-center">
        <Model
          data={data}
          style={{ width: '10rem' }}
          type="posterior"
          highlightedColors={['#3B82F6']}
          bodyColor="#D1D5DB"
        />
        <span className="text-xs text-gray-500 mt-1">Back</span>
      </div>
    </div>
  )
}
