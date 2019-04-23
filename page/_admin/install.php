<?php
require(__DIR__."/../php/sql.php");
echo "Installing DB '$db_name':<br>";

SQL::openConnection();

// comic page
SQL::query("CREATE TABLE IF NOT EXISTS `comicpage` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NULL,
  `image` VARCHAR(100) NULL,
  `createdate` DATETIME NULL,
  `pageorder` INT NULL,
  PRIMARY KEY (`id`))
COMMENT = 'A comic page consists of an image.';
");

echo "Comic page table created.<br>";

// blog post
SQL::query("CREATE TABLE IF NOT EXISTS `blogpost` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NULL,
  `text` TEXT NULL,
  `comicpage_id` INT NOT NULL,
  `createdate` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_blogpost_comicpage_idx` (`comicpage_id` ASC),
  CONSTRAINT `fk_blogpost_comicpage`
    FOREIGN KEY (`comicpage_id`)
    REFERENCES `comicpage` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
");

echo "Blog post table created.<br>";

SQL::closeConnection();

echo ("Done.<br>SQL Feedback (nothing = good): ".SQL::Feedback());
?>


