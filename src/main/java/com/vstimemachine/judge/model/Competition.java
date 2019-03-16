package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

import static com.vstimemachine.judge.model.Channel.*;
import static com.vstimemachine.judge.model.Color.*;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Competition {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    private String name;
    private String map;
    private String logo;
    private LocalDateTime dateCreate = LocalDateTime.now();
    private Boolean selected = false;

    private Boolean skipFirstGate = false;

    @Enumerated(EnumType.STRING)
    private Color color1 = BLUE;
    @Enumerated(EnumType.STRING)
    private Color color2 = RED;
    @Enumerated(EnumType.STRING)
    private Color color3 = GREEN;
    @Enumerated(EnumType.STRING)
    private Color color4 = YELLOW;
    @Enumerated(EnumType.STRING)
    private Color color5 = MAGENTA;
    @Enumerated(EnumType.STRING)
    private Color color6 = CYAN;
    @Enumerated(EnumType.STRING)
    private Color color7 = WHITE;
    @Enumerated(EnumType.STRING)
    private Color color8 = BLACK;

    @Enumerated(EnumType.STRING)
    private Channel channel1 = R1;
    @Enumerated(EnumType.STRING)
    private Channel channel2 = R2;
    @Enumerated(EnumType.STRING)
    private Channel channel3 = R3;
    @Enumerated(EnumType.STRING)
    private Channel channel4 = R4;
    @Enumerated(EnumType.STRING)
    private Channel channel5 = R5;
    @Enumerated(EnumType.STRING)
    private Channel channel6 = R6;
    @Enumerated(EnumType.STRING)
    private Channel channel7 = R7;
    @Enumerated(EnumType.STRING)
    private Channel channel8 = R8;


    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<Gate> gates;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<Sportsman> sportsmen;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<Group> groups;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    @OrderBy("sort ASC")
    private Set<Round> rounds;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<League> leagues;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<Transponder> transponders;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<Report> reports;


    public Color colorPosition(int pos){
        switch (pos){
            case 1:
                return color1;
            case 2:
                return color2;
            case 3:
                return color3;
            case 4:
                return color4;
            case 5:
                return color5;
            case 6:
                return color6;
            case 7:
                return color7;
            case 8:
                return color8;
        }
        return BLACK;
    }
}
