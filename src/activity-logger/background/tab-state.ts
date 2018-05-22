import PausableTimer from '../../util/pausable-timer'
import ScrollState from './scroll-state'
import { TabState, NavState } from './types'

class Tab implements TabState {
    static DEF_LOG_DELAY = 4000

    url: string
    isActive: boolean
    visitTime: number
    activeTime: number
    lastActivated: number
    scrollState: ScrollState
    navState: NavState
    private _timer: PausableTimer
    private _logDelay: number

    constructor(
        {
            url,
            isActive = false,
            visitTime = Date.now(),
            navState = {},
        }: Partial<TabState>,
        logDelay = Tab.DEF_LOG_DELAY,
    ) {
        this.url = url
        this.isActive = isActive
        this.visitTime = visitTime
        this.navState = navState
        this.scrollState = new ScrollState()
        this.activeTime = 0
        this.lastActivated = Date.now()

        this._timer = null
        this._logDelay = logDelay
    }

    private _pauseLogTimer() {
        if (this._timer != null) {
            this._timer.pause()
        }
    }

    private _resumeLogTimer() {
        if (this._timer != null) {
            this._timer.resume()
        }
    }

    /**
     * Sets up a PausableTimer to run the given log function. This can be stopped, started, or cancelled.
     *
     * @param logCb Logic to schedule to run on this tab later.
     */
    scheduleLog(logCb: Function) {
        this.cancelPendingOps()

        this._timer = new PausableTimer({
            delay: this._logDelay,
            cb: logCb,
            start: this.isActive, // Start timer if currently active
        })
    }

    /**
     * Updates the active and possibly ongoing timer states either to
     * mark being made active or inactive by the user.
     *
     * @param {number} [now=Date.now()] When the active state changed.
     */
    toggleActiveState(now = Date.now()) {
        if (this.isActive) {
            this.activeTime = this.activeTime + now - this.lastActivated
            this._pauseLogTimer()
        } else {
            this.lastActivated = now
            this._resumeLogTimer()
        }

        this.isActive = !this.isActive
    }

    /**
     * Cancels any scheduled log created from `scheduleLog` calls.
     */
    cancelPendingOps() {
        if (this._timer != null) {
            this._timer.clear()
            this._timer = null
        }
    }
}

export default Tab
