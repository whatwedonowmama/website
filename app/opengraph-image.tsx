import { ImageResponse } from 'next/og'

export const runtime     = 'edge'
export const alt         = 'whatwedonowmama — Family Events & Resources for OC Parents'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #5B3FA6 0%, #3a2770 100%)',
          padding: '80px 90px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-60px',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'rgba(232, 115, 90, 0.25)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-40px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(247, 208, 110, 0.18)',
            filter: 'blur(50px)',
          }}
        />

        {/* Star accents */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '120px',
            color: '#F7D06E',
            fontSize: '36px',
            opacity: 0.7,
          }}
        >
          ✦
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '200px',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '24px',
          }}
        >
          ✦
        </div>
        <div
          style={{
            position: 'absolute',
            top: '180px',
            right: '80px',
            color: 'rgba(232, 115, 90, 0.5)',
            fontSize: '18px',
          }}
        >
          ✦
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', zIndex: 1 }}>

          {/* Domain label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                background: 'rgba(247, 208, 110, 0.2)',
                border: '1px solid rgba(247, 208, 110, 0.4)',
                borderRadius: '100px',
                padding: '6px 18px',
                color: '#F7D06E',
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              whatwedonowmama.com
            </div>
          </div>

          {/* Main headline */}
          <div
            style={{
              fontSize: '68px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.05,
              letterSpacing: '-1px',
              maxWidth: '800px',
              marginBottom: '8px',
            }}
          >
            What we do{' '}
            <span style={{ color: '#F7D06E', fontStyle: 'italic' }}>now</span>
            {', mama?'}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '26px',
              color: 'rgba(237, 231, 246, 0.85)',
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: '680px',
              marginTop: '20px',
            }}
          >
            Free weekly events, parenting guides &amp; community for Orange County parents.
          </div>

          {/* Bottom row: emoji tags */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              marginTop: '44px',
            }}
          >
            {[
              { icon: '📅', label: 'Weekly Events' },
              { icon: '📖', label: 'Free Guides' },
              { icon: '👩‍👧‍👦', label: 'OC Community' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '100px',
                  padding: '10px 20px',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 500,
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
