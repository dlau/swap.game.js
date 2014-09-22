===
#DAY 0 - PLANNING
===
idea:
swap by microids (1992)

obtained binaries: http://www.emuparadise.me/Abandonware_Games/Swap_(1992)(Microids)/95205-download

run with: http://boxerapp.com/

demo: https://www.youtube.com/watch?v=fHRo-TdXaTg

---
#observations:
- gameplay
- click any polygon, if it matches a neighbor, all the connected colors vanish

- scoring
    - level
    - number swaps
    - time taken
    - supplementary tiles
        - can place supplementary tiles
    - avalanches
    - colors
    - undo
    - bonus

- shapes
    - square
    - triangle
    - hexagon

- potential extensions
    - allow for more shapes than square,triangle,hexagon
    - top score list
    - alternate scoring/goals:
        - fastest time to N remaining
        - least number of swaps, time doesnt matter
        - move timer. must make a "successful" swap within a time period or else game over
    - auto solver? determine the max possible score

---
#implementation plan for 1st pass
---
    - no multiplayer or any server stored data
    - start with squares only
        - no need to pack odd/even rows
        - no randomness
    - click the two adjacent shapes separately to swap
        - in the dos version you are supposed to click the border
    - no scoring
    - no sounds
    - no animation
    - just want to practice some algorithms, don't optimize/pixel push anything

**time: 2hrs**
===
#END DAY 0
===

===
#DAY 2
===
implementation specifics:
  fixed grid, animate with callbacks and a setTimeout
  rudimentary counter
  delete neighboring elements after swapping

need:
  fade when removing color?
  avalanche
  winning condition
