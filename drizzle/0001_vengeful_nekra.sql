CREATE TABLE `analysisRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` varchar(64) NOT NULL,
	`userId` int,
	`mode` enum('single','bi_temporal','cross_modal') NOT NULL,
	`task` varchar(64) NOT NULL,
	`query` text NOT NULL,
	`status` enum('success','partial','rejected','low_confidence','error') NOT NULL,
	`overallConfidence` int NOT NULL,
	`inputMetadataJson` text NOT NULL,
	`validationJson` text NOT NULL,
	`answer` text NOT NULL,
	`evidenceJson` text NOT NULL,
	`traceJson` text NOT NULL,
	`provenanceJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analysisRuns_id` PRIMARY KEY(`id`),
	CONSTRAINT `analysisRuns_runId_unique` UNIQUE(`runId`)
);
