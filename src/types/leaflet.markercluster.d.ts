import 'leaflet'

declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    showCoverageOnHover?: boolean
    zoomToBoundsOnClick?: boolean
    spiderfyOnMaxZoom?: boolean
    removeOutsideVisibleBounds?: boolean
    animate?: boolean
    animateAddingMarkers?: boolean
    disableClusteringAtZoom?: number
    maxClusterRadius?: number
    polygonOptions?: PolylineOptions
    singleMarkerMode?: boolean
    spiderLegPolylineOptions?: PolylineOptions
    spiderfyDistanceMultiplier?: number
    iconCreateFunction?: (cluster: MarkerCluster) => Icon | DivIcon
    chunkedLoading?: boolean
    chunkInterval?: number
    chunkDelay?: number
    chunkProgress?: (processed: number, total: number, elapsed: number) => void
  }

  interface MarkerCluster extends Marker {
    getChildCount(): number
    getAllChildMarkers(): Marker[]
    spiderfy(): void
    unspiderfy(): void
  }

  interface MarkerClusterGroup extends FeatureGroup {
    addLayer(layer: Layer): this
    addLayers(layers: Layer[]): this
    removeLayer(layer: Layer): this
    removeLayers(layers: Layer[]): this
    clearLayers(): this
    getVisibleParent(marker: Marker): Marker | MarkerCluster
    refreshClusters(clusters?: MarkerClusterGroup): this
    hasLayer(layer: Layer): boolean
    zoomToShowLayer(layer: Layer, callback?: () => void): void
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup
}
