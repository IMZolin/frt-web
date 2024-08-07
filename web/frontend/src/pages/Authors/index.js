import React from 'react';
import './Authors.css';
import CustomButton from "../../components/CustomButton/CustomButton";

const Authors = () => {
  return (
    <div className="authors">
      <h1>Authors</h1>
        <ul>
            <li>Ivan Zolin<span className="superscript">1, 2</span></li>
            <li>Alexander Sachuk<span className="superscript">1, 2</span></li>
            <li>Alexander Gerasimenko<span className="superscript">1, 3</span></li>
            <li>Ekaterina Pchitskaya<span className="superscript">1, 4, *</span></li>
            <li>Vyacheslav Chuckanov<span className="superscript">1, 2</span></li>
            <li>Ilya Bezprovanny<span className="superscript">1, 4, 5</span></li>
        </ul>
        <div className="footnote">
            <p><span className="superscript">1</span> Scientific Research Laboratory "Laboratory for the Analysis of
                Biomedical images and data", Institute of Biomedical Systems and Biotechnology, Peter the Great St.
                Petersburg
                Polytechnic University</p>
            <p><span className="superscript">2</span> <a
                href="https://english.spbstu.ru/structure/fiziko_mekhanicheskiy_institut/">Institute of Physics and
                Mechanics, Peter the Great St. Petersburg
                Polytechnic University.</a></p>
            <p><span className="superscript">3</span> The Ioffe Physical-Technical Institute of the Russian Academy of
                Sciences</p>
            <p><span className="superscript">4</span> <a
                href="https://english.spbstu.ru/structure/institut_biomeditsinskikh_sistem_i_tekhnologiy/">Institute of Biomedical Systems and Biotechnology, Peter the Great
                St. Petersburg Polytechnic University.</a> </p>
            <p><span className="superscript">5</span> <a
                href="https://utsouthwestern.elsevierpure.com/en/organisations/physiology">Physiology, University of
                Texas Southwestern Medical Center</a>.
            </p>
            <p><span className="superscript">*</span> Head of the Scientific Research Laboratory "Laboratory for the
                Analysis of Biomedical images and data", email: </p>
        </div>

        <div className="footer">
        <div className="button-container">
                <CustomButton
                    nameBtn={"Send an email to the Support Service"}
                    colorBtn={'var(--button-color2)'}
                    handleProcess={() => window.location.href = 'mailto:labid.services@yandex.ru'}
                />
            </div>
            Copyright © 2024 <a
            href="https://www.spbstu.ru/structure/nauchno_issledovatelskaya_laboratoriya_laboratoriya_analiza_biomeditsinskikh_izobrazheniy_i_dannykh_3024/">Laboratory
            for the Analysis of Biomedical images
            and data</a>. All rights reserved.
        </div>
    </div>
  );
}

export default Authors;
