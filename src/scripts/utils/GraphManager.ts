import Hex from './../components/Hex';
import Game from './../scenes/Game';

export default class GraphManager {
  private scene: Game;
  private graphs: { red: Igraph, green: Igraph };
  private neutralGraphs: { red: Igraph, green: Igraph };
  constructor(gameScene: Game) {
    this.scene = gameScene;
    this.initGraphs();
    this.initNeutralGraphs();
  }

  private initGraphByColor(color: string): void {
    this.scene.hexes.filter(el => el.own === color).forEach(el => {
      if (!this.graphs[color][el.id]) this.graphs[color][el.id] = new Set();
      Object.values(el.nearby).forEach(value => {
        if (this.scene.getHexById(value).own === color) this.graphs[color][el.id].add(value);
      });
    });
  }

  public initGraphs(): void {
    this.graphs = { red: {}, green: {} };
    this.neutralGraphs = { red: {}, green: {} };
    this.initGraphByColor('green');
    this.initGraphByColor('red');
  }

  public initNeutralGraphs(): void {
    this.scene.hexes.filter(el => el.own !== 'green').forEach(el => {
      if (!this.neutralGraphs['green'][el.id]) this.neutralGraphs['green'][el.id] = new Set();
      Object.values(el.nearby).forEach(value => {
        if (this.scene.getHexById(value)?.own !== 'green') this.neutralGraphs['green'][el.id].add(value);
      });
    });

    this.scene.hexes.filter(el => el.own !== 'red').forEach(el => {
      if (!this.neutralGraphs['red'][el.id]) this.neutralGraphs['red'][el.id] = new Set();
      Object.values(el.nearby).forEach(value => {
        if (this.scene.getHexById(value)?.own !== 'red') this.neutralGraphs['red'][el.id].add(value);
      });
    });
  }

  public checkClosure(hex: Hex): void {
    const color = hex.own;
    if (color !== 'red' && color !== 'green') return;
    const graph: Igraph = this.graphs[color];
    if (!graph[hex.id]) {
      this.addHexInGraph(graph, hex);
      this.clearOldGraph(hex);
      this.clearNeutralGraph(hex);
      const neighbors = Object.values(hex.nearby);
      const filteredNeighbors = neighbors.filter(el => graph[el]);
      filteredNeighbors.forEach((el, index) => {
        const current = el;
        const next = filteredNeighbors[index + 1];
        if (current && next) {
          const distance = this.findPathInGraph(graph, current, next);
          if (distance > 0) {
            const hexes = this.scene.hexes.filter(el => el.own === hex.own);
            const innerHexes = this.getNotOwnInnerHexes(hexes, hex.own);
            innerHexes.forEach(innerHex => {
              this.checkAndUpdateInnerHex(innerHex, color);
            });
          }
        }
      });
    }
  }

  public updateGraphs

  private checkAndUpdateInnerHex(innerHex: Hex, color: string): void {
    const outerHexId = '0-0';
    if (innerHex.own !== 'neutral') {
      if (!innerHex.super) {
        if (!innerHex.hasSuperNeighbor()) {
          const outerDistance = this.findPathInGraph(this.neutralGraphs[color], innerHex.id, outerHexId);
          if (outerDistance < 0) this.updateInnerHex(innerHex, color);
        }
      }
    } else {
      const outerDistance = this.findPathInGraph(this.neutralGraphs[color], innerHex.id, outerHexId);
      if (outerDistance < 0) this.updateInnerHex(innerHex, color);
    }
  }

  private updateInnerHex(innerHex: Hex, color: string): void {
    if (!innerHex.landscape) {
      innerHex.clame(color);
      this.addHexInGraph(this.graphs[color], innerHex);
      this.clearOldGraph(innerHex);
      this.clearNeutralGraph(innerHex);
    } else {
      innerHex.own = color;
      if (innerHex.class === 'rock') innerHex.setWorldTexture(color);
    }
  }

  public addHexInGraph(graph: Igraph, hex: Hex): void {
    graph[hex.id] = graph[hex.id] || new Set();
    Object.values(hex.nearby).forEach(value => {
      if (graph[value]) {
        graph[hex.id].add(value);
        graph[value].add(hex.id);
      }
    });
  }
  
  private getNotOwnInnerHexes(hexes: Hex[], color: string): Hex[] {
    const innerHexes: Hex[] = [];
    const refactedHexes = hexes.map(el => ({
      row: el.row,
      col: el.col,
      id: el.id,
    })).sort((a, b) => {
      if (a.row > b.row) return 1;
      if (a.row < b.row) return -1;
      if (a.col > b.col) return 1;
      if (a.col < b.col) return -1;
      return 0;
    });

    const firstRow = refactedHexes[0].row;
    const lastRow = refactedHexes[refactedHexes.length - 1].row;
    for (let currentRow: number = firstRow; currentRow < lastRow; currentRow += 1) {
      const rowElements = refactedHexes.filter(el => el.row === currentRow);
      if (rowElements) {
        const left = rowElements[0];
        const right = rowElements[rowElements.length - 1];
        for (let i = left?.col; i < right?.col; i += 1) {
          const id = `${i}-${currentRow}`;
          const hex = this.scene.getHexById(id);
          if (hex?.own !== color) {
            innerHexes.push(hex);
          }
        }
      }
    }
    return innerHexes;
  }

  private clearOldGraph(hex: Hex): void {
    const color = hex.own === 'red' ? 'green' : 'red';
    if (color !== 'red' && color !== 'green') return;
    const graph = this.graphs[color];
    this.clearGraph(hex, graph);
  }

  public clearGraph(hex: Hex, graph:Igraph): void {
    delete graph[hex.id];
      
    Object.keys(graph).forEach(key => {
      if (graph[key].has(hex.id)) graph[key].delete(hex.id);
    });
  }

  public updateHexInGraphs(hex: Hex): void {
    const graph = this.graphs[hex.own];
    const neutralGraph = this.neutralGraphs[hex.own === 'green' ? 'red' : 'green'];
    this.addHexInGraph(this.neutralGraphs[hex.own], hex);
    this.clearGraph(hex, graph);
    this.clearGraph(hex, neutralGraph);
  }

  private clearNeutralGraph(hex: Hex): void {
    const color = hex.own;
    if (color !== 'red' && color !== 'green') return;
    const graph = this.neutralGraphs[color];
    const addedGraph = this.neutralGraphs[hex.own === 'red' ? 'green' : 'red'];
    this.addHexInGraph(addedGraph, hex);
    this.clearGraph(hex, graph);
  }

  private findPathInGraph(graph: Igraph, startVertex: string, endVertex: string): number {
    const distances: { [key: string]: number} = {};
    distances[startVertex] = 0;
    const queque = [startVertex];
    while (queque.length > 0) {
      const curVertex = queque.shift();
      if (graph[curVertex]) {
        graph[curVertex].forEach(neighbor => {
          if (!distances[neighbor] && distances[neighbor] !== 0) {
            distances[neighbor] = distances[curVertex] + 1;
            queque.push(neighbor);
          }
        });
      }
    }
    return distances[endVertex] || -1;
  }
};
