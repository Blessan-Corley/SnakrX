export const AI_STRATEGY_SETTINGS = {
  easy: {
    optimality: 0.65,
    lookAhead: 2,
    avoidancePriority: 0.4,
    randomness: 0.35,
    reactionTime: 0,
    safetyDistance: 0,
    selfCollisionAvoidance: 1.0,
    avoidHeadOn: false
  },
  medium: {
    optimality: 0.90,
    lookAhead: 5,
    avoidancePriority: 0.7,
    randomness: 0.12,
    reactionTime: 0,
    safetyDistance: 1,
    selfCollisionAvoidance: 1.0,
    avoidHeadOn: true
  },
  impossible: {
    optimality: 1.0,
    lookAhead: 10,
    avoidancePriority: 1.0,
    randomness: 0.0,
    reactionTime: 0,
    safetyDistance: 0,
    selfCollisionAvoidance: 1.0,
    aggressiveness: 1.0,
    avoidHeadOn: true
  }
};
