"""
Simplified FSRS-5 Spaced Repetition Scheduler.

FSRS models memory with two variables:
  - Stability (S): number of days after which recall probability = 90%
  - Difficulty (D): intrinsic card hardness, scale 1 (easy) to 10 (hard)

Ratings: 1=Again (forgot), 2=Hard, 3=Good, 4=Easy
States: new -> learning -> review -> relearning
"""
import math
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Literal

Rating = Literal[1, 2, 3, 4]

# FSRS-5 pre-trained default weights
W = [
    0.4072, 1.1829, 3.1262, 15.4722,
    7.2102, 0.5316, 1.0651, 0.0589,
    1.4952, 0.1227, 0.9866,
    2.3015, 0.1000, 0.2900,
    2.2700, 0.0100, 2.9898,
    0.5100, 0.1400,
]

REQUEST_RETENTION = 0.90
MAX_INTERVAL = 36500  # ~100 years


@dataclass
class FSRSState:
    stability: float = 0.0
    difficulty: float = 5.0
    elapsed_days: int = 0
    scheduled_days: int = 0
    reps: int = 0
    lapses: int = 0
    state: str = "new"   # new | learning | review | relearning


@dataclass
class SchedulingResult:
    next_state: FSRSState
    scheduled_days: int
    next_review: datetime


def _initial_stability(rating: Rating) -> float:
    return W[rating - 1]


def _initial_difficulty(rating: Rating) -> float:
    return W[4] - (rating - 3) * W[5]


def _next_difficulty(d: float, rating: Rating) -> float:
    d_prime = d - W[6] * (rating - 3)
    # Mean reversion toward D0 (Good = rating 3)
    d0 = W[4] - 0 * W[5]  # _initial_difficulty(3) = W[4]
    return W[7] * d0 + (1 - W[7]) * d_prime


def _short_term_stability(s: float, rating: Rating) -> float:
    return s * math.exp(W[17] * (rating - 3 + W[18]))


def _recall_stability(d: float, s: float, r: float, rating: Rating) -> float:
    hard_penalty = W[15] if rating == 2 else 1.0
    easy_bonus = W[16] if rating == 4 else 1.0
    return s * (
        math.exp(W[8])
        * (11 - d)
        * (s ** (-W[9]))
        * (math.exp(W[10] * (1 - r)) - 1)
        * hard_penalty
        * easy_bonus
    )


def _forget_stability(d: float, s: float, r: float) -> float:
    return W[11] * (d ** (-W[12])) * ((s + 1) ** W[13] - 1) * math.exp(W[14] * (1 - r))


def _retrievability(s: float, elapsed: int) -> float:
    if s <= 0:
        return 0.0
    return (1 + elapsed / (9 * s)) ** (-1)


def _interval(s: float) -> int:
    i = s / 9 * (REQUEST_RETENTION ** (-1) - 1)
    return max(1, min(int(round(i)), MAX_INTERVAL))


def schedule(
    state: FSRSState,
    rating: Rating,
    last_review: datetime | None,
    now: datetime,
) -> SchedulingResult:
    """Core FSRS scheduling: given current state + rating, return new state + next review."""
    elapsed = max(0, (now - last_review).days) if last_review else 0
    r = _retrievability(state.stability, elapsed) if state.state == "review" else 1.0

    ns = FSRSState(
        stability=state.stability,
        difficulty=state.difficulty,
        elapsed_days=elapsed,
        reps=state.reps,
        lapses=state.lapses,
    )

    if state.state == "new":
        ns.stability = _initial_stability(rating)
        ns.difficulty = _initial_difficulty(rating)
        ns.reps = 1
        if rating <= 2:
            ns.state = "learning"
            interval = 1
        else:
            ns.state = "review"
            interval = _interval(ns.stability)

    elif state.state in ("learning", "relearning"):
        ns.stability = _short_term_stability(max(state.stability, 0.1), rating)
        ns.difficulty = _next_difficulty(state.difficulty, rating)
        ns.reps += 1
        if rating >= 3:
            ns.state = "review"
            interval = _interval(ns.stability)
        else:
            ns.lapses += 1
            ns.state = state.state  # stay in learning/relearning
            interval = 1

    else:  # review
        ns.difficulty = _next_difficulty(state.difficulty, rating)
        ns.reps += 1
        if rating == 1:
            ns.lapses += 1
            ns.stability = _forget_stability(state.difficulty, state.stability, r)
            ns.state = "relearning"
            interval = 1
        else:
            ns.stability = _recall_stability(state.difficulty, state.stability, r, rating)
            ns.state = "review"
            interval = _interval(ns.stability)

    ns.scheduled_days = interval
    return SchedulingResult(
        next_state=ns,
        scheduled_days=interval,
        next_review=now + timedelta(days=interval),
    )
