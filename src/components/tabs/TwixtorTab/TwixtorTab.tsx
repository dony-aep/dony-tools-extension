import { useState, useCallback, useEffect } from 'react'
import { Button, Checkbox, Input, TextField } from 'react-aria-components'
import { useApp } from '../../../context/AppContext'
import { Dropdown } from '../../ui/Dropdown'
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
  const { evalScript } = useApp()

  useEffect(() => {
    let cancelled = false
    evalScript('getTwixtorInfo()').then((result) => {
      if (cancelled) return
      try {
        const info = JSON.parse(result) as TwixtorInfo
        setTwixtorInfo(info)
      } catch {
        setTwixtorInfo({ installed: false, name: '', variant: '', compatible: false })
      }
    })
    return () => { cancelled = true }
  }, [evalScript])

  const isNumeric = (value: string) => !isNaN(parseFloat(value)) && isFinite(Number(value))

  const handleApplyTwixtor = useCallback(async () => {
    if (!isNumeric(speed)) {
      await evalScript('showSpeedAlert()')
      setSpeed('50')
      return
    }
    if (!isNumeric(frameRate)) {
      await evalScript('showNumericAlert()')
      setFrameRate('30')
      return
    }
    const settings = JSON.stringify({
      speed: parseFloat(speed),
      frameRate: parseFloat(frameRate),
      motionVectors: parseInt(motionVectors),
      imagePrep: parseInt(imagePrep),
      frameInterp: parseInt(frameInterp),
      warping: parseInt(warping),
      batch: batchMode,
    })
    const result = await evalScript(`precomposeAndApplyTwixtor(${settings})`)
    console.log('Twixtor result:', result)
  }, [speed, frameRate, motionVectors, imagePrep, frameInterp, warping, batchMode, evalScript])

  const handleNumericChange = useCallback(
    async (value: string, setter: (v: string) => void, defaultVal: string) => {
      if (value !== '' && !isNumeric(value)) {
        await evalScript('showNumericAlert()')
        setter(defaultVal)
        return
      }
      setter(value)
    },
    [evalScript],
  )

  return (
    <div className={styles.tab} id="twixtor">
      {/* Speed */}
      <div className={styles.section} title="Playback speed percentage for the retimed clip">
        <h3 className={styles.sectionTitle}>Speed</h3>
        <div className={styles.inputWrapper}>
          <TextField
            value={speed}
            onChange={(v) => handleNumericChange(v, setSpeed, '50')}
            aria-label="Speed percentage"
          >
            <Input id="speedInput" />
          </TextField>
          <span className={`material-symbols-outlined ${styles.inputSymbol}`}>percent</span>
        </div>
      </div>

      {/* Frame Rate */}
      <div className={styles.section} title="Frame rate of the original source footage">
        <h3 className={styles.sectionTitle}>Input: Frame Rate</h3>
        <div className={styles.inputWrapper}>
          <TextField
            value={frameRate}
            onChange={(v) => handleNumericChange(v, setFrameRate, '30')}
            aria-label="Input frame rate"
          >
            <Input id="fpsInput" />
          </TextField>
          <span className={`material-symbols-outlined ${styles.inputSymbol}`}>slow_motion_video</span>
        </div>
      </div>

      {/* Dropdowns */}
      <div className={styles.section} title="Quality of motion vector calculation — higher is slower but more accurate">
        <h3 className={styles.sectionTitle}>Motion Vectors</h3>
        <Dropdown
          options={MOTION_VECTORS_OPTIONS}
          value={motionVectors}
          placeholder="Select..."
          onChange={setMotionVectors}
          aria-label="Motion Vectors quality"
        />
      </div>

      <div className={styles.section} title="Preprocessing applied to improve motion estimation">
        <h3 className={styles.sectionTitle}>Image Prep</h3>
        <Dropdown
          options={IMAGE_PREP_OPTIONS}
          value={imagePrep}
          placeholder="Select..."
          onChange={setImagePrep}
          aria-label="Image Prep mode"
        />
      </div>

      <div className={styles.section} title="Method used to interpolate between existing frames">
        <h3 className={styles.sectionTitle}>Frame Interp</h3>
        <Dropdown
          options={FRAME_INTERP_OPTIONS}
          value={frameInterp}
          placeholder="Select..."
          onChange={setFrameInterp}
          aria-label="Frame Interpolation method"
        />
      </div>

      <div className={styles.section} title="Warping technique for generating new frames">
        <h3 className={styles.sectionTitle}>Warping</h3>
        <Dropdown
          options={WARPING_OPTIONS}
          value={warping}
          placeholder="Select..."
          onChange={setWarping}
          aria-label="Warping method"
        />
      </div>

      {/* Apply Button */}
      <div className={styles.applySection}>
        <span title="Apply Twixtor to all selected layers instead of just the first one">
          <Checkbox
            className={styles.checkbox}
            isSelected={batchMode}
            onChange={setBatchMode}
          >
            <div className={styles.checkboxBox} />
            Apply to all selected layers
          </Checkbox>
        </span>
        <span title="Precompose selected layers and apply Twixtor with current settings">
          <Button className="primary-btn" onPress={handleApplyTwixtor} aria-label="Precompose selected layers and apply Twixtor with current settings">
            Apply Twixtor
          </Button>
        </span>
      </div>

      {/* Plugin Info */}
      <div className={`${styles.infoBar} ${
        twixtorInfo
          ? twixtorInfo.installed
            ? twixtorInfo.compatible
              ? styles.infoInstalled
              : styles.infoWarning
            : styles.infoMissing
          : styles.infoLoading
      }`}>
        <span className="material-symbols-outlined">
          {twixtorInfo
            ? twixtorInfo.installed
              ? twixtorInfo.compatible ? 'check_circle' : 'warning'
              : 'error'
            : 'progress_activity'
          }
        </span>
        <span className={styles.infoText}>
          {!twixtorInfo
            ? 'Detecting Twixtor...'
            : twixtorInfo.installed
              ? twixtorInfo.compatible
                ? `${twixtorInfo.name} — Compatible`
                : `${twixtorInfo.name} — Update to v5+ for compatibility`
              : 'Twixtor not found'
          }
        </span>
      </div>
    </div>
  )
}
