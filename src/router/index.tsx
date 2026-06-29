import { createHashRouter } from 'react-router-dom'
import HomeView from '../views/HomeView'
import PredictView from '../views/PredictView'

export const router = createHashRouter([
  { path: '/', element: <HomeView /> },
  { path: '/predict/:tournamentId', element: <PredictView /> },
])
