export type Node = {
  node_id: string;
  state: number;
  impedance: number;
};

export const NODES_DEFAULT_VALUES: Node[] = [
  { node_id: "C3", state: 0, impedance: 0 },
  { node_id: "Cz", state: 0, impedance: 0 },
  { node_id: "C4", state: 0, impedance: 0 },
  { node_id: "L3", state: 0, impedance: 0 },
  { node_id: "L2", state: 0, impedance: 0 },
  { node_id: "L4", state: 0, impedance: 0 },
  { node_id: "L1", state: 0, impedance: 0 },
  { node_id: "L5", state: 0, impedance: 0 },
  { node_id: "L8", state: 0, impedance: 0 },
  { node_id: "L6", state: 0, impedance: 0 },
  { node_id: "L7", state: 0, impedance: 0 },
  { node_id: "R2", state: 0, impedance: 0 },
  { node_id: "R3", state: 0, impedance: 0 },
  { node_id: "R1", state: 0, impedance: 0 },
  { node_id: "R4", state: 0, impedance: 0 },
  { node_id: "R8", state: 0, impedance: 0 },
  { node_id: "R5", state: 0, impedance: 0 },
  { node_id: "R7", state: 0, impedance: 0 },
  { node_id: "R6", state: 0, impedance: 0 },
];

export type Node2 = {
  id: string;
  x: number;
  y: number;
  r: number;
};

export const NODES: Node2[] = [
  { id: "C3", x: 663 * (2 / 3), y: 188 * (5 / 8), r: 10 },
  { id: "Cz", x: 729 * (2 / 3), y: 170 * (5 / 8), r: 10 },
  { id: "C4", x: 796 * (2 / 3), y: 188 * (5 / 8), r: 10 },
  { id: "L3", x: 593 * (2 / 3), y: 412 * (5 / 8), r: 10 },
  { id: "L2", x: 635 * (2 / 3), y: 404 * (5 / 8), r: 10 },
  { id: "L4", x: 600 * (2 / 3), y: 467 * (5 / 8), r: 10 },
  { id: "L1", x: 654 * (2 / 3), y: 446 * (5 / 8), r: 10 },
  { id: "L5", x: 622 * (2 / 3), y: 540 * (5 / 8), r: 10 },
  { id: "L8", x: 679 * (2 / 3), y: 516 * (5 / 8), r: 10 },
  { id: "L6", x: 648 * (2 / 3), y: 592 * (5 / 8), r: 10 },
  { id: "L7", x: 683 * (2 / 3), y: 580 * (5 / 8), r: 10 },
  { id: "R2", x: 831 * (2 / 3), y: 401 * (5 / 8), r: 10 },
  { id: "R3", x: 865 * (2 / 3), y: 418 * (5 / 8), r: 10 },
  { id: "R1", x: 799 * (2 / 3), y: 447 * (5 / 8), r: 10 },
  { id: "R4", x: 853 * (2 / 3), y: 467 * (5 / 8), r: 10 },
  { id: "R8", x: 776 * (2 / 3), y: 511 * (5 / 8), r: 10 },
  { id: "R5", x: 826 * (2 / 3), y: 535 * (5 / 8), r: 10 },
  { id: "R7", x: 762 * (2 / 3), y: 563 * (5 / 8), r: 10 },
  { id: "R6", x: 804 * (2 / 3), y: 582 * (5 / 8), r: 10 },
];
