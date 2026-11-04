import type { MapCorner } from '@/components/TrackMap';
import type { ProjectSummary } from './types';

export function toMapCorner(project: ProjectSummary): MapCorner {
  return {
    id: project.corner.id,
    name: project.corner.name,
    position: project.position,
    turn: project.corner.turn,
    segment: project.corner.segment,
    marker: project.corner.marker,
    zoomOrigin: project.corner.zoomOrigin,
  };
}
