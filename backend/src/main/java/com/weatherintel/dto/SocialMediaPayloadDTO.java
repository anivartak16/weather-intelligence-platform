package com.weatherintel.dto;

import java.util.List;
import java.util.Map;

/**
 * High-fidelity Data Transfer Object for Social Weather Intelligence
 * Across 𝕏 / Twitter, Instagram, Facebook, YouTube, Reddit, and Telegram.
 */
public class SocialMediaPayloadDTO {
    private String id;
    private String trackingId;
    private String platform; // TWITTER, INSTAGRAM, FACEBOOK, YOUTUBE, REDDIT, TELEGRAM
    private String authorName;
    private String handle;
    private String authorAvatar;
    private boolean verifiedUser;
    private String timestamp;
    private String createdAt;
    private String text;
    private List<String> hashtags;
    private String locationName;
    private String area;
    private String city;
    private String district;
    private Double latitude;
    private Double longitude;
    private Double[] coordinates; // [longitude, latitude]
    private String event; // Waterlogging, Flash Flood, Heavy Rain, Thunderstorm, Traffic Alert
    private String severity; // CRITICAL, HIGH, MODERATE, NORMAL
    private String status; // VERIFIED, UNDER_REVIEW, FLAGGED
    private Integer aiConfidence;
    private String sentiment; // URGENT_DISTRESS, OBJECTIVE_OBSERVATION, COMMUNITY_HELP, MISINFORMATION_RUMOR
    private String mediaType;
    private String mediaUrl;
    private String mediaCaption;
    private Integer relatedReportsCount;
    private boolean radarCorrelated;
    private String flagReason;
    private List<Map<String, Object>> relatedReports;

    public SocialMediaPayloadDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getHandle() { return handle; }
    public void setHandle(String handle) { this.handle = handle; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public boolean isVerifiedUser() { return verifiedUser; }
    public void setVerifiedUser(boolean verifiedUser) { this.verifiedUser = verifiedUser; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    // Backward compatibility for getContent() / setContent()
    public String getContent() { return text; }
    public void setContent(String content) { this.text = content; }

    // Backward compatibility for getAuthor() / setAuthor()
    public String getAuthor() { return authorName; }
    public void setAuthor(String author) { this.authorName = author; }

    public List<String> getHashtags() { return hashtags; }
    public void setHashtags(List<String> hashtags) { this.hashtags = hashtags; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDistrict() { return district != null ? district : area; }
    public void setDistrict(String district) { this.district = district; }

    public Double getLatitude() {
        if (latitude != null) return latitude;
        if (coordinates != null && coordinates.length > 1) return coordinates[1];
        return null;
    }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() {
        if (longitude != null) return longitude;
        if (coordinates != null && coordinates.length > 0) return coordinates[0];
        return null;
    }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double[] getCoordinates() {
        if (coordinates != null) return coordinates;
        if (longitude != null && latitude != null) return new Double[]{longitude, latitude};
        return null;
    }
    public void setCoordinates(Double[] coordinates) {
        this.coordinates = coordinates;
        if (coordinates != null && coordinates.length >= 2) {
            this.longitude = coordinates[0];
            this.latitude = coordinates[1];
        }
    }

    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(Integer aiConfidence) { this.aiConfidence = aiConfidence; }

    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }

    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public String getMediaCaption() { return mediaCaption; }
    public void setMediaCaption(String mediaCaption) { this.mediaCaption = mediaCaption; }

    public Integer getRelatedReportsCount() { return relatedReportsCount; }
    public void setRelatedReportsCount(Integer relatedReportsCount) { this.relatedReportsCount = relatedReportsCount; }

    public boolean isRadarCorrelated() { return radarCorrelated; }
    public void setRadarCorrelated(boolean radarCorrelated) { this.radarCorrelated = radarCorrelated; }

    public String getFlagReason() { return flagReason; }
    public void setFlagReason(String flagReason) { this.flagReason = flagReason; }

    public List<Map<String, Object>> getRelatedReports() { return relatedReports; }
    public void setRelatedReports(List<Map<String, Object>> relatedReports) { this.relatedReports = relatedReports; }
}
