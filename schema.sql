-- WellCare MySQL Schema
-- Import this into your phpMyAdmin database

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `clinic_stats`
--

CREATE TABLE IF NOT EXISTS `clinic_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clinic_id` varchar(255) DEFAULT NULL,
  `total_patients` int(11) DEFAULT 0,
  `total_revenue` decimal(15,2) DEFAULT 0.00,
  `total_doctors` int(11) DEFAULT 0,
  `total_appointments` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `demo_data`
--

CREATE TABLE IF NOT EXISTS `demo_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `appointments`
--

CREATE TABLE IF NOT EXISTS `appointments` (
  `id` varchar(50) NOT NULL,
  `clinic_id` varchar(255) DEFAULT NULL,
  `doctor_id` varchar(50) DEFAULT NULL,
  `patient_id` varchar(50) DEFAULT NULL,
  `patient_name` varchar(255) DEFAULT NULL,
  `doctor_name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `amount` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `patients`
--

CREATE TABLE IF NOT EXISTS `patients` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `address` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `medical_records`
--

CREATE TABLE IF NOT EXISTS `medical_records` (
  `id` varchar(50) NOT NULL,
  `patient_id` varchar(50) DEFAULT NULL,
  `patient_name` varchar(255) DEFAULT NULL,
  `doctor_name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `prescription` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Initial Data Seeding
--

INSERT INTO `clinic_stats` (`clinic_id`, `total_patients`, `total_revenue`, `total_doctors`, `total_appointments`) VALUES
('default-clinic', 487, 124500.50, 168, 1250);

INSERT INTO `demo_data` (`type`, `data`) VALUES
('doctors', '[{"id": "doc-1", "name": "Dr. Jeffrey Williams", "specialty": "Cardiology", "fees": 1000, "rating": 4.8}, {"id": "doc-2", "name": "Dr. Sarah Smith", "specialty": "Neurology", "fees": 1200, "rating": 4.9}, {"id": "doc-3", "name": "Dr. Mike Ross", "specialty": "Pediatrics", "fees": 800, "rating": 4.7}]');

COMMIT;
