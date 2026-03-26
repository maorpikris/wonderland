import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export type Point = {
  type: 'Point';
  coordinates: [number, number, number]; // [longitude, latitude, altitude]
};

export type Phase = {
  id?: string;
  name: string;
  order: number;
  position: Point;
  duration: number;
};

export type ScanMission = {
  id: string;
  name: string;
  deviceId: string;
  isActive: boolean;
  phases: Phase[];
};

@Injectable()
export class ScanMissionService {
  private readonly logger = new Logger(ScanMissionService.name);

  // Initial Mock Data
  private missions: ScanMission[] = [
    {
      id: 'mock-mission-1',
      name: 'Nightly Patrol',
      deviceId: 'camera-001',
      isActive: false,
      phases: [
        {
          id: 'phase-1',
          name: 'Main Gate',
          order: 0,
          position: { type: 'Point', coordinates: [34.7818, 32.0853, 10] },
          duration: 30,
        },
        {
          id: 'phase-2',
          name: 'South Fence',
          order: 1,
          position: { type: 'Point', coordinates: [34.7828, 32.0863, 10] },
          duration: 45,
        },
      ],
    },
  ];

  async findAll(): Promise<ScanMission[]> {
    return this.missions;
  }

  async findOne(id: string): Promise<ScanMission> {
    const mission = this.missions.find((m) => m.id === id);
    if (!mission) throw new NotFoundException(`Mission with ID ${id} not found`);
    return mission;
  }

  async findAllByDeviceId(deviceId: string): Promise<ScanMission[]> {
    return this.missions.filter((m) => m.deviceId === deviceId);
  }

  async create(data: Partial<ScanMission>): Promise<ScanMission> {
    const newMission = {
      id: `mock-mission-${Date.now()}`,
      name: data.name || 'New Mission',
      deviceId: data.deviceId || 'unknown',
      isActive: false,
      phases: (data.phases || []).map((p, index) => ({
        ...p,
        id: `phase-${index}-${Date.now()}`,
      })),
    };
    this.missions.push(newMission);
    return newMission;
  }

  async update(id: string, data: Partial<ScanMission>): Promise<ScanMission> {
    const index = this.missions.findIndex((m) => m.id === id);
    if (index === -1) throw new NotFoundException(`Mission with ID ${id} not found`);

    const updated = {
      ...this.missions[index],
      ...data,
      phases: data.phases ? data.phases.map((p, idx) => ({ ...p, id: p.id || `phase-${idx}-${Date.now()}` })) : this.missions[index].phases,
    };
    this.missions[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.missions.findIndex((m) => m.id === id);
    if (index === -1) return false;
    this.missions.splice(index, 1);
    return true;
  }

  async toggleActive(id: string): Promise<ScanMission> {
    const mission = await this.findOne(id);
    this.missions.forEach((m) => {
      if (m.deviceId === mission.deviceId) m.isActive = false;
    });
    mission.isActive = !mission.isActive;
    return mission;
  }
}
