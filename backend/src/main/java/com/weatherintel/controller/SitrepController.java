package com.weatherintel.controller;

import com.weatherintel.service.sitrep.SitrepService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class SitrepController {

    private final SitrepService sitrepService;

    public SitrepController(SitrepService sitrepService) {
        this.sitrepService = sitrepService;
    }

    @GetMapping({"/api/admin/sitrep", "/api/reports/sitrep"})
    public ResponseEntity<?> getSitrep(
            @RequestParam(defaultValue = "Indore") String district,
            @RequestHeader(value = "Accept", defaultValue = "application/json") String acceptHeader) {
        if (acceptHeader != null && acceptHeader.contains("text/plain")) {
            Map<String, Object> s = sitrepService.generateSituationReport(district);
            StringBuilder sb = new StringBuilder();
            sb.append("=====================================================\n");
            sb.append("SURAKSHA-NET EMERGENCY SITUATION REPORT (SITREP)\n");
            sb.append("=====================================================\n\n");
            sb.append("Incident: ").append(s.get("incidentName")).append("\n");
            sb.append("Report ID: ").append(s.get("sitrepId")).append("\n");
            sb.append("Generated At: ").append(s.get("generatedAt")).append("\n");
            sb.append("Jurisdiction: ").append(s.get("district")).append("\n");
            sb.append("Total Reports Ingested: ").append(s.get("totalReportsIngested")).append("\n");
            sb.append("Ground Truth Verified: ").append(s.get("verifiedGroundTruthCount")).append("\n");
            sb.append("Active Rescue Dispatches: ").append(s.get("emergencyActionsDispatched")).append("\n");
            sb.append("AI Rumors Suppressed: ").append(s.get("rumorsSuppressedByAI")).append("\n");
            sb.append("Critical Incidents: ").append(s.get("criticalSeverityCount")).append("\n");
            sb.append("Active Shelters: ").append(s.get("totalSheltersOperational"))
              .append(" (Capacity: ").append(s.get("shelterCapacityTotal"))
              .append(", Occupancy: ").append(s.get("shelterOccupancyCurrent")).append(")\n");
            sb.append("Recommended Action: ").append(s.get("recommendedAction")).append("\n\n");
            sb.append("-----------------------------------------------------\n");
            sb.append("END OF TRANSMISSION - OFFICIAL DEOC/NDRF LOG\n");
            return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(sb.toString());
        }
        return ResponseEntity.ok(sitrepService.generateSituationReport(district));
    }

    @GetMapping(value = {"/api/admin/sitrep/html", "/api/reports/sitrep/html"}, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getPrintableSitrep(
            @RequestParam(defaultValue = "Indore") String district) {
        return ResponseEntity.ok(sitrepService.generatePrintableHtml(district));
    }
}
