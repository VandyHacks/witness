import random
import statistics
import collections
import math
import pickle
import os

NUM_JUDGES = 15
NUM_ROOMS = 5
NUM_SESSIONS = 20

assert NUM_JUDGES == 15
assert NUM_ROOMS == 5
assert NUM_SESSIONS <= 21

"""final = []
for triplet in itertools.combinations(range(NUM_JUDGES), 3):
    found = False
    for lists in final:
        found = True
        for s in lists:
            if len(set(triplet).intersection(set(s))) != 0:
                found = False
                break
        if found:
            lists.append(tuple(triplet))
            break
    if not found:
        final.append([tuple(triplet)])

valid_final = []
for triplets in final:
    if len(triplets) == 5:
        valid_final.append(triplets)"""

valid_final = [
    [(0, 1, 2), (3, 4, 5), (6, 7, 8), (9, 10, 11), (12, 13, 14)],
    [(0, 1, 6), (2, 3, 7), (4, 5, 8), (9, 10, 12), (11, 13, 14)],
    [(0, 1, 10), (2, 3, 11), (4, 5, 12), (6, 7, 13), (8, 9, 14)],
    [(0, 1, 13), (2, 3, 12), (4, 5, 11), (6, 8, 9), (7, 10, 14)],
    [(0, 1, 14), (2, 4, 6), (3, 5, 7), (8, 9, 12), (10, 11, 13)],
    [(0, 2, 5), (1, 3, 4), (6, 8, 12), (7, 9, 13), (10, 11, 14)],
    [(0, 2, 6), (1, 3, 7), (4, 5, 14), (8, 9, 13), (10, 11, 12)],
    [(0, 3, 5), (1, 2, 4), (6, 8, 14), (7, 10, 12), (9, 11, 13)],
    [(0, 3, 14), (1, 4, 7), (2, 5, 6), (8, 10, 13), (9, 11, 12)],
    [(0, 4, 6), (1, 2, 14), (3, 5, 9), (7, 8, 10), (11, 12, 13)],
    [(0, 4, 7), (1, 3, 14), (2, 5, 8), (6, 9, 11), (10, 12, 13)],
    [(0, 4, 12), (1, 5, 10), (2, 6, 9), (3, 7, 11), (8, 13, 14)],
    [(0, 4, 13), (1, 5, 11), (2, 6, 12), (3, 7, 9), (8, 10, 14)],
    [(0, 5, 7), (1, 4, 9), (2, 6, 13), (3, 8, 10), (11, 12, 14)],
    [(0, 5, 10), (1, 4, 12), (2, 7, 11), (3, 6, 8), (9, 13, 14)],
    [(0, 5, 11), (1, 4, 13), (2, 7, 10), (3, 6, 9), (8, 12, 14)],
    [(0, 6, 7), (1, 5, 13), (2, 4, 9), (3, 8, 11), (10, 12, 14)],
    [(0, 6, 14), (1, 7, 13), (2, 5, 10), (3, 4, 9), (8, 11, 12)],
    [(0, 7, 14), (1, 8, 9), (2, 10, 11), (3, 4, 6), (5, 12, 13)],
    [(0, 8, 9), (1, 7, 14), (2, 10, 12), (3, 5, 6), (4, 11, 13)],
    [(0, 8, 10), (1, 9, 11), (2, 5, 7), (3, 6, 12), (4, 13, 14)],
]


def get_diffs(sol):
    rooms = collections.defaultdict(list)
    for session in sol:
        for room, triplet in enumerate(session):
            for judge in triplet:
                rooms[judge].append(room)
    diffs = []
    for judge, rooms in rooms.items():
        diff = 0
        prev = rooms[0]
        for room in rooms[1:]:
            if prev != room:
                diff += 1
            prev = room
        diffs.append(diff)
    return diffs


best_triplets = None
best_diff_var = None
best_diff_mean = None
best_diffs = None
best_diff_value = None

for _ in range(100):
    for triplets in valid_final:
        random.shuffle(triplets)
    for _ in range(100):
        random.shuffle(valid_final)
        sol = valid_final[:NUM_SESSIONS]
        diffs = get_diffs(sol)
        diff_mean = statistics.mean(diffs)
        diff_var = statistics.variance(diffs)
        diff_range = max(diffs) - min(diffs)
        # diff_value = diff_mean ** 2 + diff_var
        diff_value = diff_mean ** 2 + diff_var
        # if best_diff_var is None or diff_var < best_diff_var:
        # if best_diff_mean is None or diff_mean < best_diff_mean:
        if best_diff_value is None or diff_value < best_diff_value:
            best_diff_mean = diff_mean
            best_diff_var = diff_var
            best_diff_range = diff_range
            best_diff_value = diff_value
            best_triplets = [session.copy() for session in sol]
            best_diffs = diffs


print(best_triplets)
print("Mean:", best_diff_mean)
print("Std Dev:", math.sqrt(best_diff_var))

dir_path = os.path.dirname(os.path.realpath(__file__))
with open(f"{dir_path}/sol.dump", "wb") as f:
    pickle.dump(best_triplets, f)
