import { useState, useCallback, useEffect } from 'react'
import { useApp } from '../../../context/AppContext'
import { toEvalLiteral } from '../../../hooks/useCSInterface'
import { isNumeric, useNumericInput } from '../../../hooks/useNumericInput'
import { Dropdown } from '../../ui/Dropdown'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Toggle } from '../../ui/Toggle'
import { ValueField } from '../../ui/ValueField'
import styles from './TwixtorTab.module.css'

interface TwixtorInfo {
  installed: boolean
  name: string
  variant: string
  compatible: boolean
  error?: string
}

const MOTION_VECTORS_OPTIONS = [
  { label: 'No Motion Vectors', value: '1' },
  { label: 'Sloppy', value: '2' },
  { label: 'Medium', value: '3' },
  { label: 'High', value: '4' },
  { label: 'Best', value: '5' },
]

const IMAGE_PREP_OPTIONS = [
  { label: 'None', value: '1' },
  { label: 'Contrast / Edge Enhance', value: '2' },
]

const FRAME_INTERP_OPTIONS = [
  { label: 'Nearest', value: '1' },
  { label: 'Blend', value: '2' },
  { label: 'Motion Weighted Blend', value: '3' },
]

const WARPING_OPTIONS = [
  { label: 'Inverse', value: '1' },
  { label: 'Inverse w/ Smart Blend', value: '2' },
  { label: 'Forward', value: '3' },
  { label: 'Forward w/ Smart Blend', value: '4' },
]

export function TwixtorTab() {
  const [speed, setSpeed] = useState('50')
  const [frameRate, setFrameRate] = useState('30')
  const [motionVectors, setMotionVectors] = useState('5')
  const [imagePrep, setImagePrep] = useState('2')
  const [frameInterp, setFrameInterp] = useState('3')
  const [warping, setWarping] = useState('2')
  const [batchMode, setBatchMode] = useState(false)
  const [twixtorInfo, setTwixtorInfo] = useState<TwixtorInfo | null>(null)
  const { evalHostScript, notify } = useApp()

  useEffect(() => {
    let cancelled = false
    evalHostScript('getTwixtorInfo()').then((result) => {
      if (cancelled) return
      try {
        const info = JSON.parse(result) as TwixtorInfo
        setTwixtorInfo(info)
      } catch {
        setTwixtorInfo({ installed: false, name: '', variant: '', compatible: false })
      }
    })
    return () => { cancelled = true }
  }, [evalHostScript])

  const handleNumericChange = useNumericInput()

  const handleApplyTwixtor = useCallback(async () => {
    if (!isNumeric(speed)) {
      notify('Speed needs a number. Reset to 50%.', 'warning')
      setSpeed('50')
      return
    }
    if (!isNumeric(frameRate)) {
      notify('Source rate needs a number. Reset to 30 fps.', 'warning')
      setFrameRate('30')
      return
    }
    const settings = toEvalLiteral({
      speed: parseFloat(speed),
      frameRate: parseFloat(frameRate),
      motionVectors: parseInt(motionVectors),
      imagePrep: parseInt(imagePrep),
      frameInterp: parseInt(frameInterp),
      warping: parseInt(warping),
      batch: batchMode,
    })
    const result = await evalHostScript(`precomposeAndApplyTwixtor(${settings})`)
    console.log('Twixtor result:', result)
  }, [speed, frameRate, motionVectors, imagePrep, frameInterp, warping, batchMode, evalHostScript, notify])


  const status = !twixtorInfo
    ? { icon: 'progress_activity', text: 'Detecting Twixtor…', alert: false, loading: true }
    : !twixtorInfo.installed
      ? { icon: 'error', text: 'Twixtor not found', alert: true, loading: false }
      : !twixtorInfo.compatible
        ? { icon: 'warning', text: `${twixtorInfo.name} — update to v5+ for compatibility`, alert: true, loading: false }
        : { icon: 'check_circle', text: `${twixtorInfo.name} — compatible`, alert: false, loading: false }

  return (
    <div className={styles.tab}>
      <Section title="Timing">
        <div className={styles.valueRow}>
          <ValueField
            id="speedInput"
            label="Speed"
            value={speed}
            onChange={(v) => handleNumericChange(v, setSpeed, '50')}
            unit="%"
          />
          <ValueField
            id="fpsInput"
            label="Source rate"
            value={frameRate}
            onChange={(v) => handleNumericChange(v, setFrameRate, '30')}
            unit="fps"
          />
        </div>
      </Section>

      <Section title="Quality">
        <div className={styles.settings}>
          <Dropdown
            label="Motion vectors"
            inlineLabel
            options={MOTION_VECTORS_OPTIONS}
            value={motionVectors}
            placeholder="Select…"
            onChange={setMotionVectors}
          />
          <Dropdown
            label="Image prep"
            inlineLabel
            options={IMAGE_PREP_OPTIONS}
            value={imagePrep}
            placeholder="Select…"
            onChange={setImagePrep}
          />
          <Dropdown
            label="Frame interp"
            inlineLabel
            options={FRAME_INTERP_OPTIONS}
            value={frameInterp}
            placeholder="Select…"
            onChange={setFrameInterp}
          />
          <Dropdown
            label="Warping"
            inlineLabel
            options={WARPING_OPTIONS}
            value={warping}
            placeholder="Select…"
            onChange={setWarping}
          />
        </div>
      </Section>

      <div className={styles.apply}>
        <p className={styles.applyNote}>Precomposes the selection first.</p>
        <Toggle
          label="Apply to all selected layers"
          isSelected={batchMode}
          onChange={setBatchMode}
        />
        <Button variant="key" block onPress={handleApplyTwixtor}>
          Apply Twixtor
        </Button>

        <div
          className={`${styles.status}${status.alert ? ` ${styles.statusAlert}` : ''}${status.loading ? ` ${styles.statusLoading}` : ''}`}
          role="status"
        >
          <Icon name={status.icon} size={17} className={styles.statusIcon} />
          <span className={styles.statusText}>{status.text}</span>
        </div>
      </div>
    </div>
  )
}
