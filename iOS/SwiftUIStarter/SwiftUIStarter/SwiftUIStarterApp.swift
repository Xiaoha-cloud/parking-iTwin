import SwiftUI
import ITwinMobile

@main
struct SwiftUIStarterApp: App {
    private var application = ModelApplication()
    
    init() {
        // Allow a Chrome debugger to be attached to the backend
        ITMViewController.allowInspectBackend = true
    }

    var body: some Scene {
        return WindowGroup {
            ITMSwiftUIContentView(application: application)
                .edgesIgnoringSafeArea(.all)
                .onOpenURL() { url in
                    if isValidURL(url) {
                        DocumentHelper.openInboxURL(url)
                    } else {
                        print("Invalid URL received: \(url)")
                    }
                }
        }
    }

    func isValidURL(_ url: URL) -> Bool {
        // 添加验证URL逻辑
        return true
    }
}
