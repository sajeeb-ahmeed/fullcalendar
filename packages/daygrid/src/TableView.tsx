import {
  VNode, h,
  createFormatter,
  View,
  memoize,
  getViewClassNames,
  GotoAnchor,
  SimpleScrollGrid,
  SimpleScrollGridSection,
  ChunkContentCallbackArgs
} from '@fullcalendar/core'
import TableDateProfileGenerator from './TableDateProfileGenerator'


const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


/* An abstract class for the daygrid views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a Table subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.


export default abstract class TableView<State={}> extends View<State> {

  protected processOptions = memoize(this._processOptions)
  private colWeekNumbersVisible: boolean // computed option


  renderLayout(headerRowContent: VNode | null, bodyContent: (contentArg: ChunkContentCallbackArgs) => VNode) {
    let classNames = getViewClassNames(this.props.viewSpec).concat('fc-dayGrid-view')

    this.processOptions(this.context.options)

    let sections: SimpleScrollGridSection[] = []

    if (headerRowContent) {
      sections.push({
        type: 'head',
        className: 'fc-head',
        chunk: {
          scrollerClassName: 'fc-head-container',
          rowContent: headerRowContent
        }
      })
    }

    sections.push({
      type: 'body',
      className: 'fc-body',
      chunk: {
        scrollerClassName: 'fc-day-grid-container',
        content: bodyContent
      }
    })

    return (
      <div class={classNames.join(' ')}>
        <SimpleScrollGrid
          vGrow={!this.props.isHeightAuto}
          cols={[ { width: 'shrink' } ]}
          sections={sections}
        />
      </div>
    )
  }


  private _processOptions(options) {
    let cellWeekNumbersVisible: boolean
    let colWeekNumbersVisible: boolean

    if (options.weekNumbers) {
      if (options.weekNumbersWithinDays) {
        cellWeekNumbersVisible = true
        colWeekNumbersVisible = false
      } else {
        cellWeekNumbersVisible = false
        colWeekNumbersVisible = true
      }
    } else {
      colWeekNumbersVisible = false
      cellWeekNumbersVisible = false
    }

    this.colWeekNumbersVisible = colWeekNumbersVisible

    return { cellWeekNumbersVisible, colWeekNumbersVisible }
  }


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/

  // TODO: give eventLimit to DayTable

  // // is the event limit a constant level number?
  // if (eventLimit && typeof eventLimit === 'number') {
  //   table.limitRows(eventLimit) // limit the levels first so the height can redistribute after
  // }

  // // is the event limit dynamically calculated?
  // if (eventLimit && typeof eventLimit !== 'number') {
  //   table.limitRows(eventLimit) // limit the levels after the grid's row heights have been set
  // }


  /* Header Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before the day-of week header cells
  renderHeadIntro = (): VNode[] => {
    let { theme, options } = this.context

    if (this.colWeekNumbersVisible) {
      return [
        <th class={'fc-week-number fc-shrink ' + theme.getClass('tableCellHeader')}>
          <span>
            {options.weekLabel}
          </span>
        </th>
      ]
    }

    return []
  }


  /* Table Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before content-skeleton cells that display the day/week numbers
  renderNumberIntro = (row: number, cells: any): VNode[] => {
    let { options, dateEnv } = this.context
    let weekStart = cells[row][0].date
    let colCnt = cells[0].length

    if (this.colWeekNumbersVisible) {
      return [
        <td class='fc-week-number fc-shrink'>
          <GotoAnchor
            navLinks={options.navLinks}
            gotoOptions={{ date: weekStart, type: 'week', forceOff: colCnt === 1 }}
          >{dateEnv.format(weekStart, WEEK_NUM_FORMAT)}</GotoAnchor>
        </td>
      ]
    }

    return []
  }


  // Generates the HTML that goes before the day bg cells for each day-row
  renderBgIntro = (): VNode[] => {
    let { theme } = this.context

    if (this.colWeekNumbersVisible) {
      return [
        <td class={'fc-week-number fc-shrink ' + theme.getClass('tableCellNormal')}></td>
      ]
    }

    return []
  }


  // Generates the HTML that goes before every other type of row generated by Table.
  // Affects mirror-skeleton and highlight-skeleton rows.
  renderIntro = (): VNode[] => {

    if (this.colWeekNumbersVisible) {
      return [
        <td class='fc-week-number fc-shrink'></td>
      ]
    }

    return []
  }

}

TableView.prototype.dateProfileGeneratorClass = TableDateProfileGenerator


// Determines whether each row should have a constant height
export function hasRigidRows(options) {
  let eventLimit = options.eventLimit

  return eventLimit && typeof eventLimit !== 'number'
}
