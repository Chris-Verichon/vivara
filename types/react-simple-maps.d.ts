declare module "react-simple-maps" {
  import type { ReactNode, CSSProperties } from "react"

  export interface GeographyStyle {
    fill?: string
    stroke?: string
    strokeWidth?: number
    outline?: string
    cursor?: string
    transition?: string
  }

  export interface GeographyProps {
    geography: GeoFeature
    style?: {
      default?: GeographyStyle
      hover?: GeographyStyle
      pressed?: GeographyStyle
    }
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    key?: string
  }

  export interface GeoFeature {
    rsmKey: string
    id: string | number
    properties: Record<string, unknown>
    type: string
    geometry: unknown
  }

  export interface GeographiesChildrenProps {
    geographies: GeoFeature[]
  }

  export interface GeographiesProps {
    geography: string | object
    children: (props: GeographiesChildrenProps) => ReactNode
  }

  export interface ComposableMapProps {
    projectionConfig?: { scale?: number; center?: [number, number]; rotate?: [number, number, number] }
    style?: CSSProperties
    width?: number
    height?: number
    children?: ReactNode
  }

  export interface ZoomableGroupProps {
    zoom?: number
    center?: [number, number]
    onMoveEnd?: (data: { zoom: number; coordinates: [number, number] }) => void
    children?: ReactNode
  }

  export interface MarkerProps {
    coordinates: [number, number]
    onClick?: () => void
    children?: ReactNode
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element
  export function Geographies(props: GeographiesProps): JSX.Element
  export function Geography(props: GeographyProps): JSX.Element
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element
  export function Marker(props: MarkerProps): JSX.Element
  export function Sphere(props: { id?: string; fill?: string; stroke?: string; strokeWidth?: number }): JSX.Element
  export function Graticule(props: { stroke?: string; strokeWidth?: number }): JSX.Element
}
