import UIKit
import React

// Sends the iPhone Duo's hinge state to JavaScript as "hingeChange" events:
// { status: 'closed' | 'partiallyOpen' | 'fullyOpen' | 'unknown' | 'unavailable',
//   angle: degrees (absent when unavailable) }.
// Uses UIHingeInteraction, which needs iOS 27.1; on older iOS no event is sent.
@objc(DuoLayoutHinge)
class DuoLayoutHinge: RCTEventEmitter {
  private var interaction: AnyObject?
  private var hasListeners = false
  private var lastState: [String: Any]?

  override static func requiresMainQueueSetup() -> Bool { true }

  override func supportedEvents() -> [String]! { ["hingeChange"] }

  override func startObserving() {
    hasListeners = true
    DispatchQueue.main.async {
      // A listener added after the first update still gets the current state.
      if let lastState = self.lastState {
        self.sendEvent(withName: "hingeChange", body: lastState)
      }
      self.attach()
    }
  }

  override func stopObserving() {
    hasListeners = false
  }

  private func attach() {
    guard interaction == nil, #available(iOS 27.1, *),
          let window = UIApplication.shared.connectedScenes
            .compactMap({ ($0 as? UIWindowScene)?.keyWindow }).first
    else { return }

    let hinge = UIHingeInteraction { [weak self] _, update in
      guard let self else { return }
      let state: [String: Any]
      if let h = update.hinge {
        state = ["status": Self.name(of: h.status), "angle": h.angle * 180 / .pi]
      } else {
        // The window left a hierarchy that provides hinge updates.
        state = ["status": "unavailable"]
      }
      self.lastState = state
      if self.hasListeners {
        self.sendEvent(withName: "hingeChange", body: state)
      }
    }
    window.addInteraction(hinge)
    interaction = hinge
  }

  @available(iOS 27.1, *)
  private static func name(of status: UIHinge.Status) -> String {
    switch status {
    case .closed: return "closed"
    case .partiallyOpen: return "partiallyOpen"
    case .fullyOpen: return "fullyOpen"
    default: return "unknown"
    }
  }
}
