import { PatrolTask } from './patrolTask.js';

const PATROL_REWARD_POINTS_PER_DESTINATION = 100;

class PatrolEvent {
  #id;
  #task;
  #rewardPoints;
  #isRewardClaimed;

  constructor(id, { destinations }) {
    this.#id = id;
    this.#task = new PatrolTask({ destinations });
    this.#rewardPoints = destinations.length * PATROL_REWARD_POINTS_PER_DESTINATION;
    this.#isRewardClaimed = false;
  }

  visitLocation(locationId) {
    return this.#task.visitLocation(locationId);
  }

  isExecuting() {
    return this.#task.isExecuting();
  }

  isSucceeded() {
    return this.#task.isSucceeded();
  }

  claimRewardPoints() {
    if (!this.isSucceeded() || this.#isRewardClaimed) {
      return null;
    }

    this.#isRewardClaimed = true;
    return this.#rewardPoints;
  }

  getSnapshot() {
    const task = this.#task.getSnapshot();
    return {
      id: this.#id,
      type: 'patrol',
      name: '見回り',
      description: createPatrolDescription(task.destinations),
      ...task,
      rewardPoints: this.#rewardPoints,
    };
  }
}

function createPatrolDescription(destinations) {
  const destinationDescriptions = destinations.map(destination => (
    `${destination.name}（${destination.isVisited ? '訪問済み' : '未訪問'}）`
  ));
  return `見回り先: ${destinationDescriptions.join('、')}`;
}

export {
  PatrolEvent,
};
