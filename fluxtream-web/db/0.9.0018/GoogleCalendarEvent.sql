CREATE TABLE `Facet_GoogleCalendarEvent` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `api` int(11) NOT NULL,
  `apiKeyId` bigint(20) DEFAULT NULL,
  `comment` longtext,
  `end` bigint(20) NOT NULL,
  `fullTextDescription` longtext,
  `guestId` bigint(20) NOT NULL,
  `isEmpty` char(1) NOT NULL,
  `objectType` int(11) NOT NULL,
  `start` bigint(20) NOT NULL,
  `tags` longtext,
  `timeUpdated` bigint(20) NOT NULL,
  `attendees` varchar(255) DEFAULT NULL,
  `colorId` varchar(255) DEFAULT NULL,
  `created` bigint(20) NOT NULL,
  `creator` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `endTimeUnspecified` bit(1) DEFAULT NULL,
  `etag` varchar(255) DEFAULT NULL,
  `googleId` varchar(255) DEFAULT NULL,
  `guestsCanSeeOtherGuests` bit(1) DEFAULT NULL,
  `hangoutLink` varchar(255) DEFAULT NULL,
  `htmlLink` varchar(255) DEFAULT NULL,
  `iCalUID` varchar(255) DEFAULT NULL,
  `kind` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `locked` bit(1) DEFAULT NULL,
  `organizer` varchar(255) DEFAULT NULL,
  `originalStartTime` bigint(20) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `summary` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `isEmpty_index` (`isEmpty`),
  KEY `end_index` (`end`),
  KEY `start_index` (`start`),
  KEY `api_index` (`api`),
  KEY `objectType_index` (`objectType`),
  KEY `guestId_index` (`guestId`),
  KEY `googleId` (`googleId`),
  KEY `apiKey` (`apiKeyId`),
  KEY `timeUpdated_index` (`timeUpdated`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;